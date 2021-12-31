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

module "postgres_main_prod" {
  source = "./modules/pg"

  name        = "main"
  environment = "production"

  vpc_id = module.vpc.id

  subnet_group_name = aws_db_subnet_group.main.name

  allowed_security_group_ids = [
    module.service_api_prod.security_group_id,
    module.service_house_prod.security_group_id
  ]
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "elasticache-subnet-group"
  subnet_ids = module.vpc.private_subnet_ids
}

module "redis_house_prod" {
  source = "./modules/redis"

  name        = "main"
  environment = "production"

  vpc_id = module.vpc.id

  subnet_group_name = aws_elasticache_subnet_group.main.name

  allowed_security_group_ids = [
    module.service_house_prod.security_group_id
  ]
}

resource "aws_ecr_repository" "main" {
  name = var.app_name
}

resource "aws_ecs_cluster" "production" {
  name = "production"
}

resource "aws_ecs_cluster" "staging" {
  name = "staging"
}

module "service_api_prod" {
  source = "./services/api"

  region = var.region

  hostname        = "fanbase.lol"
  route53_zone_id = aws_route53_zone.main.zone_id

  environment = "production"

  cluster_id   = aws_ecs_cluster.production.id
  cluster_name = aws_ecs_cluster.production.name

  vpc_id     = module.vpc.id
  subnet_ids = module.vpc.public_subnet_ids

  lb_dns               = module.alb.dns
  lb_zone_id           = module.alb.zone_id
  lb_security_group_id = module.alb.security_group_id

  lb_listener_arn = module.alb.https_listener_arn

  ecr_repo_url = aws_ecr_repository.main.repository_url
  ecr_repo_arn = aws_ecr_repository.main.arn

  secrets_manager_arn = var.api_secrets_manager_arn

  github_branch = "master"
  github_token  = var.github_token

  instance_count = 1

  postgres_database_url = module.postgres_main_prod.database_url
}

module "service_house_prod" {
  source = "./services/house"

  region = var.region

  hostname    = "fanbase.lol"
  environment = "production"

  cluster_id   = aws_ecs_cluster.production.id
  cluster_name = aws_ecs_cluster.production.name

  vpc_id     = module.vpc.id
  subnet_ids = module.vpc.public_subnet_ids

  lb_dns               = module.alb.dns
  lb_zone_id           = module.alb.zone_id
  lb_listener_arn      = module.alb.https_listener_arn
  lb_security_group_id = module.alb.security_group_id

  route53_zone_id = aws_route53_zone.main.zone_id

  ecr_repo_url = aws_ecr_repository.main.repository_url
  ecr_repo_arn = aws_ecr_repository.main.arn

  secrets_manager_arn = var.house_secrets_manager_arn

  github_branch = "master"
  github_token  = var.github_token

  instance_count = 1

  postgres_database_url = module.postgres_main_prod.database_url
  redis_url             = module.redis_house_prod.redis_url
}
