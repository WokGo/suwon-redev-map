#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027
APP_NAME=suwon-redev-map

# 사전 체크
command -v aws >/dev/null || { echo "aws CLI가 필요합니다. 먼저 install.sh 또는 install+deploy.sh로 설치하세요."; exit 1; }
command -v terraform >/dev/null || { echo "Terraform 필요"; exit 1; }
command -v ansible >/dev/null || { echo "Ansible 필요"; exit 1; }
command -v jq >/dev/null || { echo "jq 필요"; exit 1; }

# 1) 입력 받기: FQDN
read -p "▶ 연결할 FQDN (예: map.example.com): " FQDN
if [[ -z "${FQDN:-}" ]]; then
  echo "FQDN을 입력해야 합니다."; exit 1
fi

# 2) Hosted Zone 자동 탐색(가장 긴 suffix 일치)
echo "Route53 Hosted Zone 자동 탐색 중..."
HZ_JSON=$(aws route53 list-hosted-zones --output json)
HZ_COUNT=$(echo "$HZ_JSON" | jq '.HostedZones | length')
if [[ "$HZ_COUNT" -eq 0 ]]; then
  echo "Route53 Hosted Zone이 없습니다. 콘솔에서 먼저 Hosted Zone을 생성하세요."
  exit 1
fi

# 모든 HostedZone 중 FQDN의 최장 suffix와 일치하는 zone 선택
BEST_ID=""
BEST_NAME=""
BEST_LEN=0

for row in $(echo "$HZ_JSON" | jq -r '.HostedZones[] | @base64'); do
  _jq(){ echo ${row} | base64 --decode | jq -r ${1}; }
  ZNAME=$(_jq '.Name')         # ex) example.com.
  ZID=$(_jq '.Id')             # ex) /hostedzone/Z123ABC...
  # 끝의 점 제거
  ZNAME_STRIPPED="${ZNAME%.}"
  # FQDN이 해당 Zone으로 끝나는지 검사
  if [[ ".$FQDN" == *".${ZNAME_STRIPPED}" ]]; then
    LEN=${#ZNAME_STRIPPED}
    if (( LEN > BEST_LEN )); then
      BEST_LEN=$LEN
      BEST_NAME="$ZNAME_STRIPPED"
      BEST_ID="${ZID#/hostedzone/}"
    fi
  fi
done

if [[ -z "${BEST_ID}" ]]; then
  echo "자동 탐색 실패. Hosted Zone ID를 직접 입력하세요."
  read -p "▶ Hosted Zone ID (예: Z123ABCDEF...): " BEST_ID
  read -p "▶ Hosted Zone Name (예: example.com): " BEST_NAME
  if [[ -z "${BEST_ID}" || -z "${BEST_NAME}" ]]; then
    echo "Hosted Zone 정보가 필요합니다."; exit 1
  fi
fi

echo "선택된 Hosted Zone:"
echo "  Zone Name : ${BEST_NAME}"
echo "  Zone ID   : ${BEST_ID}"

# 3) Terraform 변수 주입
echo "Terraform 변수 파일에 도메인 정보 기록..."
TFVARS="$ROOT/terraform/terraform.tfvars"
if [[ ! -f "$TFVARS" ]]; then
  echo "terraform.tfvars가 없어 생성합니다."
  mkdir -p "$ROOT/terraform"
  cat > "$TFVARS" <<EOF
aws_region = "ap-northeast-2"
project_name = "suwon-redev"
instance_type = "t3.micro"
domain_name = "${FQDN}"
hosted_zone_id = "${BEST_ID}"
EOF
else
  # domain_name / hosted_zone_id 라인을 갱신(존재 시 교체, 없으면 추가)
  grep -q '^domain_name' "$TFVARS" && \
    sed -i "s|^domain_name.*|domain_name = \"${FQDN}\"|g" "$TFVARS" || \
    echo "domain_name = \"${FQDN}\"" >> "$TFVARS"

  grep -q '^hosted_zone_id' "$TFVARS" && \
    sed -i "s|^hosted_zone_id.*|hosted_zone_id = \"${BEST_ID}\"|g" "$TFVARS" || \
    echo "hosted_zone_id = \"${BEST_ID}\"" >> "$TFVARS"
fi

# 4) 프론트 빌드(보장)
echo "React 빌드 실행..."
cd "$ROOT/$APP_NAME"
npm run build

# 5) Terraform + Ansible 배포(on.sh) 호출
echo "인프라 생성 및 배포 시작..."
cd "$ROOT"
if [[ ! -x "./on.sh" ]]; then
  echo "on.sh가 없습니다. install.sh 또는 install+deploy.sh를 먼저 실행하세요."
  exit 1
fi

./on.sh

# 6) 결과 출력
EC2_IP=$(cd "$ROOT/terraform" && terraform output -raw ec2_public_ip)
echo
echo "==================== 결과 ===================="
echo "EC2 공인 IP : ${EC2_IP}"
echo "도메인      : http://${FQDN}/  (Route53 A레코드 적용)"
echo "직접 IP접속 : http://${EC2_IP}/"
echo "=============================================="
