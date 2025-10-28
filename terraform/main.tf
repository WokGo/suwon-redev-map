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

locals {
  private_subnets = {
    a = {
      cidr = "10.20.2.0/24"
      az   = data.aws_availability_zones.available.names[0]
    }
    b = {
      cidr = "10.20.3.0/24"
      az   = data.aws_availability_zones.available.names[min(1, length(data.aws_availability_zones.available.names) - 1)]
    }
  }

  monitoring_enabled           = var.enable_rds && var.enable_enhanced_monitoring
  free_storage_threshold_bytes = var.db_free_storage_threshold_mb * 1024 * 1024
}

resource "aws_vpc" "main" {
  cidr_block           = "10.20.0.0/16"
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

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public"
  }
}

resource "aws_subnet" "private" {
  for_each                = local.private_subnets
  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.project_name}-private-${each.key}"
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

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
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

resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-frontend-sg"
  description = "Allow web traffic to React tier"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
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

  tags = {
    Name = "${var.project_name}-frontend-sg"
  }
}

resource "aws_security_group" "backend" {
  name        = "${var.project_name}-backend-sg"
  description = "Allow API traffic from frontend tier"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "API traffic from frontend"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-backend-sg"
  }
}

resource "aws_security_group" "rds" {
  count       = var.enable_rds ? 1 : 0
  name        = "${var.project_name}-rds-sg"
  description = "Allow DB traffic from backend tier"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "DB access from backend"
    from_port       = var.db_engine == "mysql" ? 3306 : 5432
    to_port         = var.db_engine == "mysql" ? 3306 : 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_iam_role" "rds_monitoring" {
  count = local.monitoring_enabled ? 1 : 0

  name = "${var.project_name}-rds-monitoring"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-rds-monitoring"
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = local.monitoring_enabled ? 1 : 0
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

resource "aws_instance" "frontend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.kp.key_name
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.frontend.id]

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

resource "aws_instance" "backend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.kp.key_name
  subnet_id                   = aws_subnet.public.id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.backend.id]

  tags = {
    Name = "${var.project_name}-backend"
  }
}

resource "aws_db_subnet_group" "app" {
  count      = var.enable_rds ? 1 : 0
  name       = "${var.project_name}-db-subnet"
  subnet_ids = [for s in aws_subnet.private : s.id]

  tags = {
    Name = "${var.project_name}-db-subnet"
  }
}

resource "aws_db_instance" "app" {
  count                           = var.enable_rds ? 1 : 0
  identifier                      = "${var.project_name}-db"
  engine                          = var.db_engine
  engine_version                  = var.db_engine_version
  instance_class                  = var.db_instance_class
  allocated_storage               = var.db_allocated_storage
  storage_type                    = "gp3"
  username                        = var.db_username
  password                        = var.db_password
  db_name                         = var.db_name
  port                            = var.db_engine == "mysql" ? 3306 : 5432
  db_subnet_group_name            = aws_db_subnet_group.app[0].name
  vpc_security_group_ids          = [aws_security_group.rds[0].id]
  publicly_accessible             = false
  skip_final_snapshot             = true
  backup_retention_period         = var.db_backup_retention
  apply_immediately               = true
  auto_minor_version_upgrade      = true
  multi_az                        = false
  deletion_protection             = false
  monitoring_interval             = local.monitoring_enabled ? 60 : 0
  monitoring_role_arn             = local.monitoring_enabled ? aws_iam_role.rds_monitoring[0].arn : null
  enabled_cloudwatch_logs_exports = var.db_engine == "postgres" ? ["postgresql"] : []

  tags = {
    Name = "${var.project_name}-db"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  count               = var.enable_rds ? 1 : 0
  alarm_name          = "${var.project_name}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = var.db_cpu_alarm_threshold
  alarm_actions       = var.cloudwatch_alarm_actions
  ok_actions          = var.cloudwatch_alarm_actions
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.app[0].id
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_low_storage" {
  count               = var.enable_rds ? 1 : 0
  alarm_name          = "${var.project_name}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = local.free_storage_threshold_bytes
  alarm_actions       = var.cloudwatch_alarm_actions
  ok_actions          = var.cloudwatch_alarm_actions
  treat_missing_data  = "breaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.app[0].id
  }
}

resource "aws_route53_record" "frontend_a" {
  count   = var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 60
  records = [aws_instance.frontend.public_ip]
}

output "frontend_public_ip" {
  value = aws_instance.frontend.public_ip
}

output "backend_public_ip" {
  value = aws_instance.backend.public_ip
}

output "frontend_private_ip" {
  value = aws_instance.frontend.private_ip
}

output "backend_private_ip" {
  value = aws_instance.backend.private_ip
}

output "rds_endpoint" {
  value = length(aws_db_instance.app) > 0 ? aws_db_instance.app[0].endpoint : ""
}

output "rds_database" {
  value = length(aws_db_instance.app) > 0 ? aws_db_instance.app[0].db_name : ""
}

output "rds_username" {
  value = length(aws_db_instance.app) > 0 ? aws_db_instance.app[0].username : ""
}

output "rds_port" {
  value = length(aws_db_instance.app) > 0 ? aws_db_instance.app[0].port : 0
}

output "app_db_username" {
  value = var.app_db_username
}

output "app_db_password" {
  value     = var.app_db_password
  sensitive = true
}

output "ssh_private_key_path" {
  value = local_file.private_key.filename
}

output "ssh_user" {
  value = "ubuntu"
}

output "domain_fqdn" {
  value = var.domain_name
}

output "frontend_connect_ssh" {
  value = "ssh -i ${local_file.private_key.filename} ubuntu@${aws_instance.frontend.public_ip}"
}

output "backend_connect_ssh" {
  value = "ssh -i ${local_file.private_key.filename} ubuntu@${aws_instance.backend.public_ip}"
}
