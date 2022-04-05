resource "aws_route53_record" "root_staging" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "staging"
  type    = "A"

  ttl     = 3600
  records = var.a_records_root
}

module "s3_media_staging" {
  source = "./modules/s3"

  name = "${var.app_name}-media-staging"
  allowed_origins = [
    "https://staging.${var.domain_name}"
  ]
}

# module "postgres_main_staging" {
#   source = "./modules/pg"

#   name        = "main"
#   environment = "staging"

#   vpc_id = module.vpc.id

#   subnet_group_name = aws_db_subnet_group.main.name

#   allowed_security_group_ids = [
#     module.service_api_staging.security_group_id,
#     module.service_indexer_staging.security_group_id
#   ]
# }

# module "redis_main_staging" {
#   source = "./modules/redis"

#   name        = "main"
#   environment = "staging"

#   vpc_id = module.vpc.id

#   subnet_group_name = aws_elasticache_subnet_group.main.name

#   allowed_security_group_ids = [
#     module.service_api_staging.security_group_id,
#     module.service_indexer_staging.security_group_id
#   ]
# }

# resource "aws_ecs_cluster" "staging" {
#   name = "staging"
# }

# module "service_api_staging" {
#   source = "./services/api"

#   app_name = var.app_name

#   region = var.region

#   hostname        = "staging.${var.domain_name}"
#   route53_zone_id = aws_route53_zone.main.zone_id

#   environment = "staging"

#   cluster_id   = aws_ecs_cluster.staging.id
#   cluster_name = aws_ecs_cluster.staging.name

#   vpc_id     = module.vpc.id
#   subnet_ids = module.vpc.public_subnet_ids

#   lb_dns               = module.alb.dns
#   lb_zone_id           = module.alb.zone_id
#   lb_security_group_id = module.alb.security_group_id

#   lb_listener_arn = module.alb.https_listener_arn

#   secrets_manager_arn = var.api_secrets_manager_staging_arn

#   github_user   = var.github_user
#   github_repo   = var.github_repo
#   github_branch = "staging"
#   github_token  = var.github_token

#   cpu            = 256
#   memory         = 512
#   instance_count = 1

#   postgres_database_url = module.postgres_main_staging.database_url
#   redis_url             = module.redis_main_staging.url

#   media_s3_name = module.s3_media_staging.name
# }

# module "service_indexer_staging" {
#   source = "./services/indexer"

#   environment = "staging"
#   vpc_id      = module.vpc.id
#   subnet_id   = module.vpc.public_subnet_ids[0]

#   ssh_key_name = "indexer-staging-ec2-key"

#   database_url        = module.postgres_main_staging.database_url
#   redis_url           = module.redis_main_staging.url
#   secrets_manager_arn = var.indexer_secrets_manager_staging_arn
# }
