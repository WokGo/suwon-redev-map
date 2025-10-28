#!/bin/bash
set -euo pipefail
ROOT=~/project_realeaste_map/20251027

echo "==> Terraform Apply"
cd "$ROOT/terraform"
terraform init -input=false
terraform apply -auto-approve

EC2_IP=$(terraform output -raw ec2_public_ip)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path)
SSH_KEY=$(realpath "$SSH_KEY_REL")
SSH_USER=$(terraform output -raw ssh_user)

echo "EC2_IP=$EC2_IP"
echo "SSH_KEY=$SSH_KEY"
echo "SSH_USER=$SSH_USER"

echo "==> React 빌드 (로컬)"
cd "$ROOT/suwon-redev-map"
npm run build

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
