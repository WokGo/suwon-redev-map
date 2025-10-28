#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"
APP_NAME="suwon-redev-map"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "❌ 환경 변수 DB_PASSWORD(관리자 비밀번호)를 설정해주세요. (예: export DB_PASSWORD='strong-pass')"
  exit 1
fi

PYTHON_BIN="$(command -v python3 || command -v python || true)"
if [[ -z "${PYTHON_BIN}" ]]; then
  echo "❌ python3 또는 python 실행 파일을 찾을 수 없습니다. 파이썬을 설치해주세요."
  exit 1
fi

export TF_VAR_db_password="${TF_VAR_db_password:-$DB_PASSWORD}"

echo "=== [1] 프론트엔드 빌드 ==="
if [[ ! -d "$ROOT/${APP_NAME}" ]]; then
  echo "⚠️ React 프로젝트(${APP_NAME})가 존재하지 않습니다. install.sh 실행 여부를 확인하세요."
  exit 1
fi
(
  cd "$ROOT/${APP_NAME}"
  npm run build
)

echo "=== [2] Terraform 인프라 배포 ==="
if [[ ! -d "$ROOT/terraform" ]]; then
  echo "⚠️ terraform 디렉토리가 없습니다."
  exit 1
fi
(
  cd "$ROOT/terraform"
  terraform init -upgrade
  terraform apply -auto-approve
)

echo "=== [3] Terraform 출력값 수집 ==="
cd "$ROOT/terraform"
TF_OUTPUT_FILE=$(mktemp)
terraform output -json > "$TF_OUTPUT_FILE"

read_tf_value() {
  local key="$1"
  "$PYTHON_BIN" - "$TF_OUTPUT_FILE" "$key" <<'PY'
import json, sys
file_path, key = sys.argv[1:3]
with open(file_path, 'r', encoding='utf-8') as fh:
    data = json.load(fh)
value = data.get(key, {}).get('value', "")
if isinstance(value, (list, dict)):
    import json as _json
    print(_json.dumps(value))
else:
    print(value)
PY
}

FRONTEND_IP=$(read_tf_value frontend_public_ip)
BACKEND_IP=$(read_tf_value backend_public_ip)
FRONTEND_PRIVATE_IP=$(read_tf_value frontend_private_ip)
BACKEND_PRIVATE_IP=$(read_tf_value backend_private_ip)
SSH_KEY_REL=$(read_tf_value ssh_private_key_path)
SSH_USER=$(read_tf_value ssh_user)
RDS_ENDPOINT=$(read_tf_value rds_endpoint)
RDS_DATABASE=$(read_tf_value rds_database)
RDS_USERNAME=$(read_tf_value rds_username)
APP_DB_USERNAME=$(read_tf_value app_db_username)
APP_DB_PASSWORD=$(read_tf_value app_db_password)
RDS_PORT=$(read_tf_value rds_port)

if [[ -z "$APP_DB_PASSWORD" ]]; then
  echo "❌ Terraform 출력에서 app_db_password를 가져오지 못했습니다. terraform.tfvars 설정을 확인하세요."
  rm -f "$TF_OUTPUT_FILE"
  exit 1
fi

if [[ -z "$FRONTEND_IP" || -z "$BACKEND_IP" ]]; then
  echo "❌ EC2 공인 IP를 확인할 수 없습니다."
  exit 1
fi

SSH_KEY=$(realpath "$SSH_KEY_REL")
DATABASE_URL="postgresql+psycopg2://${RDS_USERNAME}:${DB_PASSWORD}@${RDS_ENDPOINT}/${RDS_DATABASE}"
APP_DATABASE_URL="postgresql+psycopg2://${APP_DB_USERNAME}:${APP_DB_PASSWORD}@${RDS_ENDPOINT}/${RDS_DATABASE}"

echo "=== [4] Ansible 인벤토리 생성 ==="
cd "$ROOT"
mkdir -p ansible
cat > ansible/inventory.ini <<EOF
[frontend]
${FRONTEND_IP} ansible_user=${SSH_USER} ansible_ssh_private_key_file=${SSH_KEY} ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[backend]
${BACKEND_IP} ansible_user=${SSH_USER} ansible_ssh_private_key_file=${SSH_KEY} ansible_ssh_common_args='-o StrictHostKeyChecking=no'

[all:vars]
backend_private_ip=${BACKEND_PRIVATE_IP}
rds_endpoint=${RDS_ENDPOINT}
rds_port=${RDS_PORT}
rds_database=${RDS_DATABASE}
rds_username=${RDS_USERNAME}
rds_password=${DB_PASSWORD}
app_db_username=${APP_DB_USERNAME}
app_db_password=${APP_DB_PASSWORD}
EOF

rm -f "$TF_OUTPUT_FILE"

echo "=== [5] Ansible 배포 ==="
export DEPLOY_ROOT="$ROOT"
export DEPLOY_SSH_KEY="$SSH_KEY"
export DEPLOY_DATABASE_URL="$APP_DATABASE_URL"
(
  cd "$ROOT/ansible"
  ansible-playbook -i inventory.ini site.yml
)

echo
echo "🎯 배포 완료!"
echo "- Frontend: http://${FRONTEND_IP}"
echo "- Backend API: http://${FRONTEND_IP}/api/"
echo
