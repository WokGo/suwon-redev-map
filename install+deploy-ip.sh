#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027
APP_NAME=suwon-redev-map
AWS_REGION=ap-northeast-2

echo "=== [1] Terraform + Ansible 배포 시작 ==="
cd "$ROOT"

# 프론트엔드 빌드 (보장)
if [ -d "$APP_NAME" ]; then
  echo "▶ React 빌드 중..."
  cd "$APP_NAME"
  npm run build || { echo "React build 실패"; exit 1; }
  cd "$ROOT"
else
  echo "⚠️ React 프로젝트(${APP_NAME})가 없습니다. install.sh 먼저 실행하세요."
  exit 1
fi

# Terraform 폴더 존재 확인
if [ ! -d "$ROOT/terraform" ]; then
  echo "⚠️ Terraform 폴더가 없습니다. install.sh 먼저 실행하세요."
  exit 1
fi

# Terraform 초기화 및 실행
cd "$ROOT/terraform"
terraform init -upgrade
terraform apply -auto-approve

# EC2 IP 가져오기
EC2_IP=$(terraform output -raw ec2_public_ip)
SSH_KEY_REL=$(terraform output -raw ssh_private_key_path)
SSH_USER=$(terraform output -raw ssh_user)
if [ -z "$EC2_IP" ]; then
  echo "❌ EC2 IP를 가져올 수 없습니다."
  exit 1
fi
if [ -z "$SSH_KEY_REL" ]; then
  echo "❌ SSH 키 경로를 가져올 수 없습니다."
  exit 1
fi

SSH_KEY=$(realpath "$SSH_KEY_REL")

# Ansible 인벤토리 파일 생성
cd "$ROOT"
mkdir -p ansible
cat > ansible/inventory.ini <<EOF
[web]
${EC2_IP} ansible_user=${SSH_USER} ansible_ssh_private_key_file=${SSH_KEY} ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF

# Flask + React 배포
cat > ansible/deploy.yml <<'EOF'
- hosts: web
  become: true
  tasks:
    - name: SSH 접속 가능 여부 대기
      wait_for_connection:
        timeout: 120

    - name: 필수 패키지 설치
      apt:
        name:
          - nginx
          - python3-venv
          - python3-pip
        state: present
        update_cache: true

    - name: Flask app 업로드
      synchronize:
        src: "{{ lookup('env','HOME') }}/project_realeaste_map/20251027/backend/"
        dest: /opt/backend/
        recursive: yes

    - name: React build 업로드
      synchronize:
        src: "{{ lookup('env','HOME') }}/project_realeaste_map/20251027/suwon-redev-map/dist/"
        dest: /var/www/html/
        recursive: yes

    - name: Python 가상환경 설정
      command: python3 -m venv /opt/backend/venv

    - name: Flask requirements 설치
      command: /opt/backend/venv/bin/pip install -r /opt/backend/requirements.txt

    - name: Gunicorn systemd 서비스 생성
      copy:
        dest: /etc/systemd/system/gunicorn.service
        content: |
          [Unit]
          Description=Gunicorn Flask App
          After=network.target

          [Service]
          User=ubuntu
          Group=www-data
          WorkingDirectory=/opt/backend
          Environment="PATH=/opt/backend/venv/bin"
          ExecStart=/opt/backend/venv/bin/gunicorn -w 2 -b 0.0.0.0:5000 app:app

          [Install]
          WantedBy=multi-user.target

    - name: Gunicorn 서비스 활성화 및 시작
      systemd:
        name: gunicorn
        enabled: true
        state: restarted

    - name: Nginx 리버스 프록시 설정
      copy:
        dest: /etc/nginx/sites-available/default
        content: |
          server {
              listen 80;
              server_name _;
              root /var/www/html;
              index index.html;
              location /api/ {
                  proxy_pass http://127.0.0.1:5000/;
              }
          }

    - name: Nginx 재시작
      service:
        name: nginx
        state: restarted
EOF

# Ansible 실행
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml

echo
echo "🎯 배포 완료!"
echo "접속 URL: http://${EC2_IP}"
echo
