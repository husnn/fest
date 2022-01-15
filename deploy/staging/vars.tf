variable "app_name" {
  type = string
}

variable "host" {
  type = string
}

variable "environment" {
  type    = string
  default = "production"
}

variable "github_username" {
  default = "husnn"
}
variable "github_repo" {
  default = "fanbase"
}
variable "github_token" {}

variable "vercel_ip" {
  type = string
}
