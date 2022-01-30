variable "name" {}
variable "allowed_origins" {
  type = list(string)
  default = []
}