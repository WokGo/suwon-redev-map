terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws   = { source = "hashicorp/aws", version = "~> 5.0" }
    tls   = { source = "hashicorp/tls", version = "~> 4.0" }
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

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.30.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 2)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
  }
}

resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name = "${var.project_name}-nat-eip"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  depends_on    = [aws_internet_gateway.igw]

  tags = {
    Name = "${var.project_name}-nat-gw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_assoc" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
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
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.module}/id_${var.project_name}"
  file_permission = "0600"
}

# Security Groups
resource "aws_security_group" "fe" {
  name        = "${var.project_name}-fe-sg"
  description = "Allow SSH and HTTP for Frontend"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "be" {
  name        = "${var.project_name}-be-sg"
  description = "Allow app traffic from FE and SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.fe.id] # Or a specific bastion SG
  }

  ingress {
    from_port       = 5000
    to_port         = 5001
    protocol        = "tcp"
    security_groups = [aws_security_group.fe.id]
  }
  
  # Allow traffic from within the same security group for BE-to-BE communication if needed
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    self            = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Instances
resource "aws_instance" "admin_fe" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.kp.key_name
  subnet_id                   = aws_subnet.public[0].id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.fe.id]
  tags = {
    Name = "${var.project_name}-admin-fe"
  }
}

resource "aws_instance" "customer_fe" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.kp.key_name
  subnet_id                   = aws_subnet.public[1].id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.fe.id]
  tags = {
    Name = "${var.project_name}-customer-fe"
  }
}

resource "aws_instance" "admin_be" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.kp.key_name
  subnet_id                   = aws_subnet.private[0].id
  vpc_security_group_ids      = [aws_security_group.be.id]
  tags = {
    Name = "${var.project_name}-admin-be"
  }
}

resource "aws_instance" "main_be" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.kp.key_name
  subnet_id                   = aws_subnet.private[1].id
  vpc_security_group_ids      = [aws_security_group.be.id]
  tags = {
    Name = "${var.project_name}-main-be"
  }
}


# DNS - Assuming we point the main domain to the customer FE
# And a subdomain like 'admin.' for the admin FE
resource "aws_route53_record" "customer_a_record" {
  count   = var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 60
  records = [aws_instance.customer_fe.public_ip]
}

resource "aws_route53_record" "admin_a_record" {
  count   = var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = "admin.${var.domain_name}"
  type    = "A"
  ttl     = 60
  records = [aws_instance.admin_fe.public_ip]
}

# Outputs
output "admin_fe_public_ip" {
  value = aws_instance.admin_fe.public_ip
}

output "admin_fe_private_ip" {
  value = aws_instance.admin_fe.private_ip
}

output "customer_fe_public_ip" {
  value = aws_instance.customer_fe.public_ip
}

output "admin_be_private_ip" {
  value = aws_instance.admin_be.private_ip
}

output "main_be_private_ip" {
  value = aws_instance.main_be.private_ip
}

output "ssh_private_key_path" {
  value = local_file.private_key.filename
}

output "ssh_user" {
  value = "ubuntu"
}

output "connect_ssh_admin_fe" {
  value = "ssh -i ${local_file.private_key.filename} ubuntu@${aws_instance.admin_fe.public_ip}"
}

output "connect_ssh_customer_fe" {
  value = "ssh -i ${local_file.private_key.filename} ubuntu@${aws_instance.customer_fe.public_ip}"
}
