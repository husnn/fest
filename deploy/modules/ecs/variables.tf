variable "region" {
  type = string
}

variable "cluster_id" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "app_name" {
  type = string
}

variable "service_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "image_name" {
  type = string
}

variable "container_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "hostname" {
  type = string
}

variable "port" {
  type = number
}

variable "route53_zone_id" {
  type = string
}

variable "lb_listener_arn" {
  type = string
}

variable "lb_dns" {
  type = string
}

variable "lb_zone_id" {
  type = string
}

variable "lb_security_group_id" {
  type = string
}

variable "use_sticky_sessions" {
  type    = bool
  default = false
}

variable "health_check_path" {
  type    = string
  default = "/health"
}

variable "github_username" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "github_branch" {
  type    = string
  default = "master"
}

variable "github_token" {
  type = string
}

variable "cpu" {
  type = number
}

variable "memory" {
  type = number
}

variable "instance_count_desired" {
  type    = number
  default = 1
}

variable "secrets_manager_arn" {
  type    = string
  default = ""
}

variable "secret_keys" {
  type    = list(string)
  default = []
}

variable "env_vars" {
  type    = map(any)
  default = {}
}
