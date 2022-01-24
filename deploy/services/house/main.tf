module "service" {
  source = "../../modules/ecs"

  region = var.region

  cluster_id   = var.cluster_id
  cluster_name = var.cluster_name

  app_name     = var.app_name
  service_name = "house"

  image_name     = var.app_name
  container_name = "${var.app_name}_house"
  environment    = var.environment

  ecr_repo_url = var.ecr_repo_url

  hostname = "house.${var.hostname}"
  port     = 6000

  vpc_id               = var.vpc_id
  lb_dns               = var.lb_dns
  lb_zone_id           = var.lb_zone_id
  lb_listener_arn      = var.lb_listener_arn
  lb_security_group_id = var.lb_security_group_id

  use_sticky_sessions = true

  subnet_ids = var.subnet_ids

  route53_zone_id = var.route53_zone_id

  env_vars = {
    "NODE_ENV"     = var.environment
    "PORT"         = 6000
    "DATABASE_URL" = var.postgres_database_url
    "REDIS_URL"    = var.redis_url
  }

  secrets_manager_arn = var.secrets_manager_arn
  secret_keys = [
    "CLIENT_URL",
    "JWT_SECRET",
    "JWT_EXPIRY",
    "HOUSE_JWT_SECRET",
    "HOUSE_JWT_EXPIRY"
  ]

  cpu                    = var.cpu
  memory                 = var.memory
  instance_count_desired = var.instance_count
  ecr_repo_arn           = var.ecr_repo_arn

  github_username = var.github_user
  github_repo     = var.github_repo
  github_branch   = var.github_branch
  github_token    = var.github_token
}
