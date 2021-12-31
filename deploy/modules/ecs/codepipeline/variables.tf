variable "project_name" {
  type = string
}

variable "image_name" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "service_name" {
  type = string
}

variable "container_name" {
  type = string
}

variable "ecr_repo_url" {
  type = string
}

variable "codebuild_project_name" {
  type = string
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

variable "s3_bucket_name" {
  type = string
}

variable "s3_bucket_arn" {
  type = string
}

variable "codebuild_project_arn" {
  type = string
}

