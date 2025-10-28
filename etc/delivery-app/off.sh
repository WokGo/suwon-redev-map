#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027/etc/delivery-app
TF_DIR="$ROOT/terraform"

# Get IPs before destroying, ignore errors if already destroyed
cd "$TF_DIR"
ADMIN_FE_IP=$(terraform output -raw admin_fe_public_ip 2>/dev/null || true)
CUSTOMER_FE_IP=$(terraform output -raw customer_fe_public_ip 2>/dev/null || true)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path 2>/dev/null || true)

echo "==> Terraform Destroy (delivery-app)"
terraform destroy -auto-approve

echo "==> 로컬 생성물 정리"
# Remove build artifacts
rm -rf "$ROOT/SSG_FINAL_Admin-FE-main/build" "$ROOT/SSG_FINAL_RN-FE-main/web-build"

# Remove generated SSH key
if [[ -n "$SSH_KEY_REL" && -f "$SSH_KEY_REL" ]]; then
  echo "삭제 중: $SSH_KEY_REL"
  rm -f "$SSH_KEY_REL"
fi

# Remove from known_hosts
if [[ -n "$ADMIN_FE_IP" ]]; then
  echo "known_hosts에서 Admin FE IP 제거 중"
  ssh-keygen -R "$ADMIN_FE_IP"
fi
if [[ -n "$CUSTOMER_FE_IP" ]]; then
  echo "known_hosts에서 Customer FE IP 제거 중"
  ssh-keygen -R "$CUSTOMER_FE_IP"
fi

echo "완료"
