variable "region" {}

variable "hostname" {}

variable "environment" {}

variable "cluster_id" {}
variable "cluster_name" {}

variable "vpc_id" {}

variable "lb_dns" {}
variable "lb_zone_id" {}
variable "lb_listener_arn" {}
variable "lb_security_group_id" {}
variable "subnet_ids" {}

variable "route53_zone_id" {}

variable "postgres_database_url" {}

variable "ecr_repo_url" {}
variable "ecr_repo_arn" {}

variable "github_branch" {}
variable "github_token" {}

variable "secrets_manager_arn" {
  type    = string
  default = ""
}

variable "cpu" {
  type    = number
  default = 512
}

variable "memory" {
  type    = number
  default = 1024
}

variable "instance_count" {
  type    = number
  default = 2
}
