#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027/etc/delivery-app

echo "==> Terraform Apply (delivery-app)"
cd "$ROOT/terraform"
terraform init -input=false
terraform apply -auto-approve

# Get all IPs and SSH key path
ADMIN_FE_PUBLIC_IP=$(terraform output -raw admin_fe_public_ip)
ADMIN_FE_PRIVATE_IP=$(terraform output -raw admin_fe_private_ip)
CUSTOMER_FE_IP=$(terraform output -raw customer_fe_public_ip)
ADMIN_BE_IP=$(terraform output -raw admin_be_private_ip)
MAIN_BE_IP=$(terraform output -raw main_be_private_ip)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path)
SSH_USER=$(terraform output -raw ssh_user)
SSH_KEY=$(realpath "$SSH_KEY_REL")

echo "==> IPs"
echo "Admin FE (Public): $ADMIN_FE_PUBLIC_IP"
echo "Admin FE (Private): $ADMIN_FE_PRIVATE_IP"
echo "Customer FE: $CUSTOMER_FE_IP"
echo "Admin BE (Private): $ADMIN_BE_IP"
echo "Main BE (Private): $MAIN_BE_IP"
echo "SSH Key: $SSH_KEY"

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
# Use the Admin FE as the jump host for the backends
cat > "$ROOT/ansible/inventory.ini" <<INI
[admin_fe]
${ADMIN_FE_PUBLIC_IP}

[customer_fe]
${CUSTOMER_FE_IP}

[admin_be]
${ADMIN_BE_IP}

[main_be]
${MAIN_BE_IP}

[backend:children]
admin_be
main_be

[backend:vars]
ansible_ssh_common_args = -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ProxyCommand="ssh -W %h:%p -i ${SSH_KEY} ${SSH_USER}@${ADMIN_FE_PUBLIC_IP}"

[all:vars]
ansible_user=${SSH_USER}
ansible_ssh_private_key_file=${SSH_KEY}
INI

# Add new hosts to known_hosts to enable ProxyCommand
echo "==> Updating known_hosts for SSH jump"
ssh-keyscan -H "$ADMIN_FE_PUBLIC_IP" >> ~/.ssh/known_hosts
ssh-keyscan -H "$CUSTOMER_FE_IP" >> ~/.ssh/known_hosts

echo "==> Ansible 배포"
cd "$ROOT/ansible"
ansible-playbook -i inventory.ini site.yml --extra-vars "admin_be_private_ip=${ADMIN_BE_IP} main_be_private_ip=${MAIN_BE_IP} admin_fe_private_ip=${ADMIN_FE_PRIVATE_IP}"

echo "==> 완료"
echo "Customer URL: http://${CUSTOMER_FE_IP}/"
echo "Admin URL: http://${ADMIN_FE_PUBLIC_IP}/"
