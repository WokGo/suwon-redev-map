#!/bin/bash
set -euo pipefail

ROOT=~/project_realeaste_map/20251027
APP_NAME=suwon-redev-map
AWS_REGION_DEFAULT=ap-northeast-2

echo "=== [1] 필수 패키지 설치 (Terraform/Ansible/AWS CLI 포함) ==="
sudo apt update -y
sudo apt install -y python3-venv python3-pip unzip nodejs npm git curl jq gnupg software-properties-common

# Terraform (HashiCorp repo)
if ! command -v terraform >/dev/null 2>&1; then
  curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    sudo tee /etc/apt/sources.list.d/hashicorp.list
  sudo apt update -y
  sudo apt install -y terraform
fi

# Ansible
if ! command -v ansible >/dev/null 2>&1; then
  sudo apt install -y ansible
fi

# AWS CLI v2 (zip 방식)
if ! command -v aws >/dev/null 2>&1; then
  cd /tmp
  curl -fsSLo awscliv2.zip "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"
  unzip -q awscliv2.zip
  sudo ./aws/install
  rm -rf /tmp/aws /tmp/awscliv2.zip
fi
aws --version

# 프로젝트 루트
mkdir -p "$ROOT"
cd "$ROOT"

echo "=== [2] AWS configure 자동화 ==="
read -p "▶ AWS Access Key ID: " AWS_KEY
read -p "▶ AWS Secret Access Key: " AWS_SECRET
read -p "▶ AWS Region [${AWS_REGION_DEFAULT}]: " AWS_REGION
AWS_REGION=${AWS_REGION:-$AWS_REGION_DEFAULT}

mkdir -p ~/.aws
cat > ~/.aws/credentials <<EOF
[default]
aws_access_key_id = ${AWS_KEY}
aws_secret_access_key = ${AWS_SECRET}
EOF
cat > ~/.aws/config <<EOF
[default]
region = ${AWS_REGION}
output = json
EOF

echo "=== [3] Python venv + Flask 백엔드 생성 ==="
python3 -m venv venv
source venv/bin/activate
mkdir -p backend

cat > backend/requirements.txt <<'EOF'
Flask==3.1.2
gunicorn==22.0.0
EOF

pip install --upgrade pip
pip install -r backend/requirements.txt

cat > backend/app.py <<'EOF'
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/api/zones")
def zones():
    data = [
        {"id": "wooman1", "name": "우만1구역", "units": 2800},
        {"id": "wooman2", "name": "우만2구역", "units": 2700},
        {"id": "worldcup1", "name": "월드컵1구역", "units": 1500},
    ]
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
EOF

echo "=== [4] React(Vite+Tailwind+Leaflet) 구성 ==="
NEED_SCAFFOLD=0
if [[ ! -d "$ROOT/${APP_NAME}" ]]; then
  NEED_SCAFFOLD=1
  npx create-vite@5.2.0 "${APP_NAME}" -- --template react
fi

cd "${ROOT}/${APP_NAME}"

if [[ "${NEED_SCAFFOLD}" -eq 1 ]]; then
  npm install
  npm install leaflet react-leaflet@4.2.1
  npm install -D tailwindcss@3.4.14 postcss@8.4.49 autoprefixer@10.4.20
  npx tailwindcss init -p
  cat > src/index.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

  cat > src/App.jsx <<'EOF'
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Polygon, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FALLBACK_ZONES = [
  { id: "wooman1", name: "우만1구역", units: 2800 },
  { id: "wooman2", name: "우만2구역", units: 2700 },
  { id: "worldcup1", name: "월드컵1구역", units: 1500 },
];

const BASE_COORD = [37.2862, 127.0327];

export default function App() {
  const [zones, setZones] = useState(FALLBACK_ZONES);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/zones")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setZones(data))
      .catch(() => setError("API에서 구역 데이터를 불러오지 못했습니다. 기본 데이터를 표시합니다."));
  }, []);

  const polygons = useMemo(
    () =>
      zones.map((zone, idx) => {
        const latOffset = idx * 0.0025;
        return {
          zone,
          positions: [
            [BASE_COORD[0] + latOffset, BASE_COORD[1]],
            [BASE_COORD[0] + latOffset, BASE_COORD[1] + 0.01],
            [BASE_COORD[0] + latOffset + 0.002, BASE_COORD[1] + 0.005],
          ],
        };
      }),
    [zones],
  );

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">수원 재개발 현황 지도</h1>
        <p className="text-sm text-slate-500">React + Leaflet + Flask API</p>
        {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}
      </header>

      <main className="flex flex-1 flex-row divide-x divide-slate-200">
        <section className="w-80 overflow-y-auto bg-white p-4">
          <h2 className="text-lg font-medium text-slate-700">구역 목록</h2>
          <ul className="mt-4 space-y-3">
            {zones.map((zone) => (
              <li key={zone.id} className="rounded-lg border border-slate-200 p-3 shadow-sm">
                <p className="text-base font-semibold text-slate-800">{zone.name}</p>
                <p className="text-sm text-slate-500">세대수: {zone.units.toLocaleString()} 세대</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex-1">
          <MapContainer center={BASE_COORD} zoom={14} className="h-full w-full" style={{ background: "#eef2ff" }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polygons.map(({ zone, positions }) => (
              <Polygon key={zone.id} positions={positions} pathOptions={{ color: "#2563eb", fillOpacity: 0.25 }}>
                <Popup>
                  <strong>{zone.name}</strong>
                  <br />
                  {zone.units.toLocaleString()} 세대
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
        </section>
      </main>
    </div>
  );
}
EOF

  cat > tailwind.config.js <<'EOF'
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

  cat > postcss.config.js <<'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

  cat > vite.config.js <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } }
})
EOF
else
  echo "기존 React 프로젝트가 있어 생성 단계를 건너뜁니다."
  npm install
fi

cd "$ROOT"

echo "=== [5] Terraform (EC2 + SG + 선택적 Route53) 생성 ==="
mkdir -p terraform
cat > terraform/variables.tf <<'EOF'
variable "aws_region" { type = string, default = "ap-northeast-2" }
variable "project_name" { type = string, default = "suwon-redev" }
variable "instance_type" { type = string, default = "t3.micro" }
variable "domain_name" { type = string, default = "" }          # 예: map.example.com (없으면 레코드 생략)
variable "hosted_zone_id" { type = string, default = "" }       # 예: Z123456ABCDEF (없으면 레코드 생략)
EOF

cat > terraform/main.tf <<'EOF'
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
    tls = { source = "hashicorp/tls", version = "~> 4.0" }
    local = { source = "hashicorp/local", version = "~> 2.5" }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "kp" {
  key_name   = "${var.project_name}-kp"
  public_key = tls_private_key.ssh.public_key_openssh
}

resource "local_file" "private_key" {
  content  = tls_private_key.ssh.private_key_pem
  filename = "${path.module}/id_${var.project_name}"
  file_permission = "0600"
}

resource "aws_security_group" "web" {
  name        = "${var.project_name}-sg"
  description = "Allow 22,80"
  ingress { from_port = 22 to_port = 22 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 80 to_port = 80 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0  to_port = 0  protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.web.id]
  tags = { Name = "${var.project_name}-ec2" }
}

# 선택적 Route53 A 레코드
resource "aws_route53_record" "a_record" {
  count   = var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 60
  records = [aws_instance.web.public_ip]
}

output "ec2_public_ip" { value = aws_instance.web.public_ip }
output "ssh_private_key_path" { value = local_file.private_key.filename }
output "ssh_user" { value = "ubuntu" }
output "domain_fqdn" { value = var.domain_name }
EOF

cat > terraform/outputs.tf <<'EOF'
output "connect_ssh" {
  value = "ssh -i terraform/id_suwon-redev ubuntu@$(terraform output -raw ec2_public_ip)"
}
EOF

cat > terraform/terraform.tfvars <<EOF
aws_region = "${AWS_REGION}"
project_name = "suwon-redev"
instance_type = "t3.micro"
# domain_name = ""         # 예: map.example.com (있으면 주석 해제하고 값 입력)
# hosted_zone_id = ""      # 예: Z123456ABCDEF    (있으면 주석 해제하고 값 입력)
EOF

echo "=== [6] Ansible 플레이북/인벤토리 생성 ==="
mkdir -p ansible
cat > ansible/site.yml <<'EOF'
- hosts: web
  become: yes
  vars:
    app_root: /opt/app
    web_root: /var/www/html
  tasks:
    - name: 기본 패키지
      apt:
        name:
          - nginx
          - python3-venv
          - python3-pip
          - git
          - curl
        update_cache: yes
        state: present

    - name: Node.js 20 설치 (Nodesource)
      shell: |
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
      args: { warn: false }

    - name: Flask 앱 디렉토리 생성
      file: { path: "{{ app_root }}", state: directory, owner: ubuntu, group: ubuntu, mode: '0755' }

    - name: 프론트 정적 디렉토리 생성
      file: { path: "{{ web_root }}", state: directory, owner: www-data, group: www-data, mode: '0755' }

    - name: 로컬 Flask 백엔드 업로드
      synchronize:
        src: "{{ lookup('env','HOME') }}/project_realeaste_map/20251027/backend/"
        dest: "{{ app_root }}/"
        rsync_opts: ['--delete']
      delegate_to: localhost

    - name: 가상환경/의존성 설치
      shell: |
        python3 -m venv {{ app_root }}/venv
        source {{ app_root }}/venv/bin/activate
        pip install --upgrade pip
        pip install -r {{ app_root }}/requirements.txt

    - name: React 빌드 산출물 업로드
      synchronize:
        src: "{{ lookup('env','HOME') }}/project_realeaste_map/20251027/suwon-redev-map/dist/"
        dest: "{{ web_root }}/"
        rsync_opts: ['--delete']
      delegate_to: localhost

    - name: systemd 서비스 파일 생성 (gunicorn)
      copy:
        dest: /etc/systemd/system/app.service
        content: |
          [Unit]
          Description=Gunicorn Flask App
          After=network.target

          [Service]
          User=ubuntu
          Group=ubuntu
          WorkingDirectory={{ app_root }}
          Environment="PATH={{ app_root }}/venv/bin"
          ExecStart={{ app_root }}/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 app:app
          Restart=always

          [Install]
          WantedBy=multi-user.target
      notify: [ "restart app" ]

    - name: Nginx 서버블록
      copy:
        dest: /etc/nginx/sites-available/default
        content: |
          server {
            listen 80 default_server;
            server_name _;
            root {{ web_root }};
            index index.html;

            location /api/ {
              proxy_pass http://127.0.0.1:5000/;
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
            }

            location / {
              try_files $uri /index.html;
            }
          }
      notify: [ "restart nginx" ]

  handlers:
    - name: restart nginx
      service: { name: nginx, state: restarted, enabled: yes }

    - name: restart app
      systemd: { name: app, state: restarted, enabled: yes }
EOF

# 인벤토리는 on.sh에서 동적으로 생성
cat > ansible/README.md <<'EOF'
인벤토리는 on.sh 실행 시 terraform output을 읽어 ansible/inventory.ini 로 생성됩니다.
EOF

echo "=== [7] on.sh / off.sh 생성 (Terraform+Ansible 배포/종료) ==="
cat > on.sh <<'EOF'
#!/bin/bash
set -euo pipefail
ROOT=~/project_realeaste_map/20251027

echo "==> Terraform Apply"
cd "$ROOT/terraform"
terraform init -input=false
terraform apply -auto-approve

EC2_IP=$(terraform output -raw ec2_public_ip)
SSH_KEY=$(terraform output -raw ssh_private_key_path)
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
EOF

cat > off.sh <<'EOF'
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
EOF

chmod +x on.sh off.sh

echo "🎯 설치 완료!"
echo "다음 명령으로 배포하세요:"
echo "  cd $ROOT && ./on.sh"
