module "redis" {
  source = "../../modules/redis"

  name        = "indexer"
  environment = var.environment

  vpc_id = var.vpc_id

  subnet_group_name = var.elasticache_group_name

  allowed_security_group_ids = [
    module.main.security_group_id
  ]
}

data "aws_secretsmanager_secret_version" "main" {
  secret_id = var.secrets_manager_arn
}

locals {
  secrets = jsondecode(data.aws_secretsmanager_secret_version.main.secret_string)
}

resource "aws_secretsmanager_secret_version" "main" {
  secret_id = var.secrets_manager_arn
  secret_string = jsonencode({
    NODE_ENV     = var.environment
    SECRET       = lookup(local.secrets, "SECRET", null)
    ETH_PROVIDER = lookup(local.secrets, "ETH_PROVIDER", null)
    DATABASE_URL = var.database_url
    REDIS_URL    = module.redis.url
  })
}

module "main" {
  source = "../../modules/ec2"

  app_name    = "indexer"
  environment = var.environment

  vpc_id    = var.vpc_id
  subnet_id = var.subnet_id

  instance_type = var.environment != "production" ? "t2.nano" : "t2.micro"
  port          = 4000

  ssh_key_name = var.ssh_key_name
}

resource "aws_iam_role_policy" "main" {
  name = "indexer-ec2-${var.environment}-policy"
  role = module.main.role_id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Effect": "Allow",
      "Resource": "*"
    },
    {
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Effect": "Allow",
      "Resource": "${var.secrets_manager_arn}"
    }
  ]
}
EOF
}
