provider "aws" {
  profile = "default"
  region  = "eu-west-1"
}

terraform {
  backend "s3" {
    bucket = "fanbase-terraform-state-53186"
    key    = "state"
    region = "eu-west-1"
  }
}
