variable "name" {}

variable "environment" {}

variable "hostname" {}
variable "subdomain" {}

variable "route53_zone_id" {}

variable "origin_host" {}
variable "origin_path" {
  type    = string
  default = ""
}
