provider "aws" {
  profile = "default"
  region  = "eu-west-1"
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "fest-tf-state"
    key    = "state"
    region = "eu-west-1"
  }
}

module "vpc" {
  source             = "./modules/vpc"
  availability_zones = var.availability_zones
}

resource "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  ttl     = 3600
  records = var.a_records_root
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www"
  type    = "CNAME"

  ttl     = 3600
  records = [var.www_cname_root]
}

resource "aws_route53_record" "root_staging" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "staging"
  type    = "A"

  ttl     = 3600
  records = var.a_records_root
}

module "ssl" {
  source = "./modules/ssl"

  hostname        = var.domain_name
  route53_zone_id = aws_route53_zone.main.zone_id

  depends_on = [aws_route53_record.root]
}

module "alb" {
  source = "./modules/alb"

  vpc_id              = module.vpc.id
  name                = "main-lb"
  subnet_ids          = module.vpc.public_subnet_ids
  idle_timeout        = 600
  enable_ssl          = true
  ssl_certificate_arn = module.ssl.certificate_arn
  force_ssl           = true

  depends_on = [module.ssl]
}

resource "aws_db_subnet_group" "main" {
  name       = "rds-subnet-group"
  subnet_ids = module.vpc.private_subnet_ids
}

module "postgres_main_staging" {
  source = "./modules/pg"

  name        = "main"
  environment = "staging"

  vpc_id = module.vpc.id

  subnet_group_name = aws_db_subnet_group.main.name

  allowed_security_group_ids = [
    module.service_api_staging.security_group_id,
    module.service_indexer_staging.security_group_id
  ]
}

module "postgres_main_prod" {
  source = "./modules/pg"

  name        = "main"
  environment = "production"

  vpc_id = module.vpc.id

  subnet_group_name = aws_db_subnet_group.main.name

  allowed_security_group_ids = [
    module.service_api_prod.security_group_id
  ]
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "elasticache-subnet-group"
  subnet_ids = module.vpc.private_subnet_ids
}

module "redis_main_staging" {
  source = "./modules/redis"

  name        = "main"
  environment = "staging"

  vpc_id = module.vpc.id

  subnet_group_name = aws_elasticache_subnet_group.main.name

  allowed_security_group_ids = [
    module.service_indexer_staging.security_group_id
  ]
}

resource "aws_ecs_cluster" "staging" {
  name = "staging"
}

resource "aws_ecs_cluster" "prod" {
  name = "prod"
}

module "s3_media" {
  source = "./modules/s3"

  name = "media.${var.domain_name}"
  allowed_origins = [
    var.domain_name
  ]
}

module "service_api_staging" {
  source = "./services/api"

  app_name = var.app_name

  region = var.region

  hostname        = "staging.${var.domain_name}"
  route53_zone_id = aws_route53_zone.main.zone_id

  environment = "staging"

  cluster_id   = aws_ecs_cluster.staging.id
  cluster_name = aws_ecs_cluster.staging.name

  vpc_id     = module.vpc.id
  subnet_ids = module.vpc.public_subnet_ids

  lb_dns               = module.alb.dns
  lb_zone_id           = module.alb.zone_id
  lb_security_group_id = module.alb.security_group_id

  lb_listener_arn = module.alb.https_listener_arn

  secrets_manager_arn = var.api_secrets_manager_staging_arn

  github_user   = var.github_user
  github_repo   = var.github_repo
  github_branch = "staging"
  github_token  = var.github_token

  instance_count = 1

  postgres_database_url = module.postgres_main_staging.database_url

  media_s3_name = module.s3_media.name
  media_s3_url = module.s3_media.url
}

module "service_api_prod" {
  source = "./services/api"

  app_name = var.app_name

  region = var.region

  hostname        = var.domain_name
  route53_zone_id = aws_route53_zone.main.zone_id

  environment = "production"

  cluster_id   = aws_ecs_cluster.prod.id
  cluster_name = aws_ecs_cluster.prod.name

  vpc_id     = module.vpc.id
  subnet_ids = module.vpc.public_subnet_ids

  lb_dns               = module.alb.dns
  lb_zone_id           = module.alb.zone_id
  lb_security_group_id = module.alb.security_group_id

  lb_listener_arn = module.alb.https_listener_arn

  secrets_manager_arn = var.api_secrets_manager_prod_arn

  github_user   = var.github_user
  github_repo   = var.github_repo
  github_branch = "master"
  github_token  = var.github_token

  instance_count = 1

  postgres_database_url = module.postgres_main_prod.database_url

  media_s3_name = module.s3_media.name
  media_s3_url = module.s3_media.url
}

module "service_indexer_staging" {
  source = "./services/indexer"

  environment = "staging"
  vpc_id      = module.vpc.id
  subnet_id   = module.vpc.public_subnet_ids[0]

  ssh_key_name = "indexer-staging-ec2-key"

  secrets_manager_arn = var.api_secrets_manager_staging_arn
}

module "cloudfront_media" {
  source = "./modules/cloudfront"

  environment = "production"
  
  name = module.s3_media.name

  hostname  = var.domain_name
  subdomain = "media"

  route53_zone_id = aws_route53_zone.main.zone_id

  origin_host = module.s3_media.url_regional

  providers = {
    aws = aws.virginia
  }
}
