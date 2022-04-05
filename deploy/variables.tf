variable "region" {
  type    = string
  default = "eu-west-1"
}

variable "availability_zones" {
  type    = list(string)
  default = ["eu-west-1a", "eu-west-1b"]
}

variable "app_name" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "a_records_root" {
  type = list(string)
}

variable "www_cname_root" {
  type = string
}

# variable "staging_cname_root" {
#   type = string
# }

variable "github_user" {
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

variable "api_secrets_manager_staging_arn" {
  type = string
}

variable "api_secrets_manager_prod_arn" {
  type = string
}

variable "indexer_secrets_manager_staging_arn" {
  type = string
}

variable "indexer_secrets_manager_prod_arn" {
  type = string
}
