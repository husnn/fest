variable "vpc_id" {
  type = string
}

variable "name" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "idle_timeout" {
  type = number
}

variable "enable_ssl" {
  type    = string
  default = false
}

variable "ssl_certificate_arn" {
  type    = string
  default = ""
}

variable "force_ssl" {
  type    = bool
  default = false
}
