variable "app_name" {}
variable "environment" {}
variable "vpc_id" {}
variable "subnet_id" {}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ssh_key_name" {}
variable "port" {}

variable "allowed_ip" {}
