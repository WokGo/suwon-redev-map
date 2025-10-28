#!/bin/bash
set -euo pipefail
ROOT=~/project_realeaste_map/20251027

# 서비스 중지(원격)
if [ -f "$ROOT/ansible/inventory.ini" ]; then
  IP=$(awk 'NR==2{print $1}' "$ROOT/ansible/inventory.ini" || true)
  if [ -n "${IP:-}" ]; then
    echo "원격 서비스 중지: $IP"
    ssh -o StrictHostKeyChecking=no -i "$ROOT/terraform/id_suwon-redev" ubuntu@"$IP" 'sudo systemctl disable --now app || true; sudo systemctl stop nginx || true' || true
  fi
fi

echo "==> Terraform Destroy"
cd "$ROOT/terraform"
terraform destroy -auto-approve

echo "==> 로컬 빌드 산출물 정리"
rm -rf "$ROOT/suwon-redev-map/dist"

echo "완료"
