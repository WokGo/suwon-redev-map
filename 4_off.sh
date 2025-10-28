#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"

cd "$ROOT/terraform"

FRONTEND_IP=$(terraform output -raw frontend_public_ip 2>/dev/null || true)
BACKEND_IP=$(terraform output -raw backend_public_ip 2>/dev/null || true)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path 2>/dev/null || true)
SSH_USER=$(terraform output -raw ssh_user 2>/dev/null || true)

if [[ -n "${SSH_KEY_REL:-}" && -n "${SSH_USER:-}" ]]; then
  SSH_KEY=$(realpath "$SSH_KEY_REL")

  if [[ -n "${BACKEND_IP:-}" ]]; then
    echo "원격 백엔드 서비스 중지: ${BACKEND_IP}"
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "${SSH_KEY}" "${SSH_USER}@${BACKEND_IP}" \
      'sudo systemctl disable --now backend.service || true' || true
  fi

  if [[ -n "${FRONTEND_IP:-}" ]]; then
    echo "원격 프론트엔드 서비스 중지: ${FRONTEND_IP}"
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "${SSH_KEY}" "${SSH_USER}@${FRONTEND_IP}" \
      'sudo systemctl stop nginx || true' || true
  fi
fi

echo "==> Terraform Destroy"
terraform destroy -auto-approve

echo "==> 로컬 빌드 산출물 정리"
rm -rf "$ROOT/suwon-redev-map/dist"

echo "완료"
