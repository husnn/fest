module "main" {
  source = "../../modules/ec2"

  app_name    = "indexer"
  environment = var.environment

  vpc_id    = var.vpc_id
  subnet_id = var.subnet_id

  port         = 4000
  
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
