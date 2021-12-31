variable "hostname" {
  type = string
}

variable "use_www" {
  type    = bool
  default = false
}

variable "route53_zone_id" {
  type = string
}
