resource "aws_iam_policy" "media_s3" {
  name   = "api-${var.environment}-media-s3-policy"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::${var.media_s3_name}",
        "arn:aws:s3:::${var.media_s3_name}/*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "media_s3_policy" {
  role       = module.service.exec_role_name
  policy_arn = aws_iam_policy.media_s3.arn
}

module "service" {
  source = "../../modules/ecs"

  region = var.region

  cluster_id   = var.cluster_id
  cluster_name = var.cluster_name

  app_name     = var.app_name
  service_name = "api"

  image_name     = var.app_name
  container_name = "${var.app_name}_api"
  environment    = var.environment

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
    "NODE_ENV"        = var.environment
    "PORT"            = 5000
    "CLIENT_URL"      = "https://${var.hostname}"
    "API_URL"         = "https://api.${var.hostname}/v1"
    "DATABASE_URL"    = var.postgres_database_url
    "MEDIA_S3_NAME"   = var.media_s3_name
    "MEDIA_S3_REGION" = var.region
    "MEDIA_S3_URL"    = var.media_s3_url
  }

  secrets_manager_arn = var.secrets_manager_arn
  secret_keys = [
    "BYPASS_INDEXER_CONNECTION",
    "INVITE_ONLY",
    "SECRET",
    "JWT_SECRET",
    "JWT_EXPIRY",
    "ETH_PROVIDER",
    "ETH_WALLET_ADDRESS",
    "ETH_WALLET_PK",
    "MAIL_FROM_NO_REPLY",
    "SENDGRID_API_KEY",
    "PINATA_API_KEY",
    "PINATA_API_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "YOUTUBE_API_KEY"
  ]

  cpu                    = var.cpu
  memory                 = var.memory
  instance_count_desired = var.instance_count

  github_username = var.github_user
  github_repo     = var.github_repo
  github_branch   = var.github_branch
  github_token    = var.github_token
}
