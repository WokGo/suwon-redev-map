#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027/etc/delivery-app

echo "==> Terraform Apply (delivery-app)"
cd "$ROOT/terraform"
terraform init -input=false
terraform apply -auto-approve

EC2_IP=$(terraform output -raw ec2_public_ip)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path)
SSH_USER=$(terraform output -raw ssh_user)
SSH_KEY=$(realpath "$SSH_KEY_REL")

echo "EC2_IP=$EC2_IP"
echo "SSH_USER=$SSH_USER"
echo "SSH_KEY=$SSH_KEY"

echo "==> Admin FE build"
cd "$ROOT/SSG_FINAL_Admin-FE-main"
npm install
npm run build

echo "==> Customer FE (Expo web) build"
cd "$ROOT/SSG_FINAL_RN-FE-main"
npm install
rm -rf web-build
CI=1 npx expo export:web --clear

echo "==> Ansible 인벤토리 생성"
cat > "$ROOT/ansible/inventory.ini" <<INI
[web]
${EC2_IP} ansible_user=${SSH_USER} ansible_ssh_private_key_file=${SSH_KEY} ansible_ssh_common_args='-o StrictHostKeyChecking=no'
INI

echo "==> Ansible 배포"
cd "$ROOT/ansible"
ansible-playbook -i inventory.ini site.yml

echo "==> 완료"
echo "URL: http://${EC2_IP}/"
