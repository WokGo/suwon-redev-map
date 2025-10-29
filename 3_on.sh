#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "❌ 환경 변수 DB_PASSWORD(관리자 비밀번호)를 설정해주세요."
  exit 1
fi

PYTHON_BIN="$(command -v python3 || command -v python || true)"
if [[ -z "${PYTHON_BIN}" ]]; then
  echo "❌ python3 또는 python 실행 파일을 찾을 수 없습니다. 파이썬을 설치해주세요."
  exit 1
fi

export TF_VAR_db_password="${TF_VAR_db_password:-$DB_PASSWORD}"

echo "==> Terraform Apply (재배포)"
(
  cd "$ROOT/terraform"
  terraform init -input=false
  terraform apply -auto-approve
)

echo "==> Terraform 출력값 수집"
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
SSH_KEY=$(realpath "$SSH_KEY_REL")

if [[ -z "$APP_DB_PASSWORD" ]]; then
  echo "❌ Terraform 출력에서 app_db_password를 가져올 수 없습니다. terraform.tfvars 설정을 확인하세요."
  rm -f "$TF_OUTPUT_FILE"
  exit 1
fi

if [[ -z "$FRONTEND_IP" || -z "$BACKEND_IP" ]]; then
  echo "❌ EC2 공인 IP를 확인할 수 없습니다."
  rm -f "$TF_OUTPUT_FILE"
  exit 1
fi

APP_DATABASE_URL="postgresql+psycopg2://${APP_DB_USERNAME}:${APP_DB_PASSWORD}@${RDS_ENDPOINT}/${RDS_DATABASE}?sslmode=require"

echo "==> React 빌드 (로컬)"
(
  cd "$ROOT/suwon-redev-map"
  npm run build
)

echo "==> Ansible 인벤토리 갱신"
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

echo "==> Ansible 배포"
export DEPLOY_ROOT="$ROOT"
export DEPLOY_SSH_KEY="$SSH_KEY"
export DEPLOY_DATABASE_URL="$APP_DATABASE_URL"
(
  cd "$ROOT/ansible"
  ansible-playbook -i inventory.ini site.yml
)

rm -f "$TF_OUTPUT_FILE"

echo "==> 완료"
echo "- Frontend: http://${FRONTEND_IP}"
echo "- Backend API: http://${FRONTEND_IP}/api/"
