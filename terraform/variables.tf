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
