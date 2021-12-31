variable "environment" {
  type = string
}

variable "name" {
  type = string
}

variable "user" {
  type    = string
  default = "root"
}

variable "vpc_id" {
  type = string
}

variable "subnet_group_name" {
  type = string
}

variable "allowed_security_group_ids" {
  type    = list(string)
  default = []
}
