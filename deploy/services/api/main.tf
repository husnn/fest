module "service" {
  source = "../../modules/ecs"

  region = var.region

  cluster_id   = var.cluster_id
  cluster_name = var.cluster_name

  app_name     = "fanbase"
  service_name = "api"

  image_name     = "fanbase"
  container_name = "fanbase_api"
  environment    = var.environment

  ecr_repo_url = var.ecr_repo_url

  hostname = "api.${var.hostname}"
  port     = 5000

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  lb_dns               = var.lb_dns
  lb_zone_id           = var.lb_zone_id
  lb_security_group_id = var.lb_security_group_id

  lb_listener_arn = var.lb_listener_arn

  route53_zone_id = var.route53_zone_id

  env_vars = {
    "NODE_ENV"     = var.environment
    "PORT"         = 5000
    "CLIENT_URL"   = "https://fanbase.lol"
    "API_URL"      = "https://api.fanbase.lol/v1"
    "DATABASE_URL" = var.postgres_database_url
  }

  secrets_manager_arn = var.secrets_manager_arn
  secret_keys = [
    "BYPASS_INDEXER_CONNECTION",
    "INVITE_ONLY",
    "SECRET",
    "JWT_SECRET",
    "JWT_EXPIRY",
    "HOUSE_JWT_SECRET",
    "HOUSE_JWT_EXPIRY",
    "ETH_PROVIDER",
    "ETH_WALLET_ADDRESS",
    "ETH_WALLET_PK",
    "MAIL_FROM_NO_REPLY",
    "SENDGRID_API_KEY",
    "S3_TOKEN_MEDIA_NAME",
    "S3_TOKEN_MEDIA_URL",
    "S3_TOKEN_MEDIA_API_KEY",
    "S3_TOKEN_MEDIA_API_SECRET",
    "PINATA_API_KEY",
    "PINATA_API_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "YOUTUBE_API_KEY"
  ]

  cpu                    = var.cpu
  memory                 = var.memory
  instance_count_desired = var.instance_count
  ecr_repo_arn           = var.ecr_repo_arn

  github_username = "husnn"
  github_repo     = "fanbase"
  github_branch   = var.github_branch
  github_token    = var.github_token
}
