#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027/etc/delivery-app

cd "$ROOT/terraform"
EC2_IP=$(terraform output -raw ec2_public_ip 2>/dev/null || true)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path 2>/dev/null || true)
SSH_USER=$(terraform output -raw ssh_user 2>/dev/null || true)

if [[ -n "${EC2_IP}" && -n "${SSH_KEY_REL}" && -n "${SSH_USER}" ]]; then
  SSH_KEY=$(realpath "$SSH_KEY_REL")
  echo "원격 서비스 중지: ${EC2_IP}"
  ssh -o StrictHostKeyChecking=no -i "${SSH_KEY}" "${SSH_USER}@${EC2_IP}" \
    'sudo systemctl disable --now delivery-user delivery-admin || true; sudo systemctl stop nginx || true' || true
fi

echo "==> Terraform Destroy (delivery-app)"
terraform destroy -auto-approve

echo "==> 로컬 빌드 산출물 정리"
rm -rf "$ROOT/SSG_FINAL_Admin-FE-main/build" "$ROOT/SSG_FINAL_RN-FE-main/web-build"

echo "완료"
