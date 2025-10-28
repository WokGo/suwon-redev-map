variable "aws_region" {
  type    = string
  default = "ap-northeast-2"
}

variable "project_name" {
  type    = string
  default = "suwon-redev"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

# 예: map.example.com (없으면 레코드 생략)
variable "domain_name" {
  type    = string
  default = ""
}

# 예: Z123456ABCDEF (없으면 레코드 생략)
variable "hosted_zone_id" {
  type    = string
  default = ""
}

variable "enable_rds" {
  description = "Set to true to provision an RDS database for the Flask backend."
  type        = bool
  default     = true
}

variable "db_engine" {
  description = "Database engine for RDS (available when enable_rds is true)."
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Version of the database engine."
  type        = string
  default     = ""
}

variable "app_db_username" {
  description = "Application-specific database user."
  type        = string
  default     = "suwon_app"
}

variable "app_db_password" {
  description = "Password for the application database user."
  type        = string
}

variable "db_instance_class" {
  description = "Instance class for the RDS database."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "Database name used by the backend application."
  type        = string
  default     = "suwon_redev"
}

variable "db_username" {
  description = "Master username for the RDS instance."
  type        = string
  default     = "suwon_admin"
}

variable "db_password" {
  description = "Master password for the RDS instance."
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for the RDS instance."
  type        = number
  default     = 20
}

variable "db_backup_retention" {
  description = "Automated backup retention period in days."
  type        = number
  default     = 7
}

variable "enable_enhanced_monitoring" {
  description = "Enable RDS enhanced monitoring (1-minute interval)."
  type        = bool
  default     = true
}

variable "db_cpu_alarm_threshold" {
  description = "CPU utilization threshold (%) for CloudWatch alarm."
  type        = number
  default     = 70
}

variable "db_free_storage_threshold_mb" {
  description = "Minimum free storage (MB) before triggering an alarm."
  type        = number
  default     = 2048
}

variable "cloudwatch_alarm_actions" {
  description = "List of ARNs (SNS topics, etc.) to notify when alarms trigger."
  type        = list(string)
  default     = []
}
