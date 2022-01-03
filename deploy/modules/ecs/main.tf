locals {
  project_name = "${var.service_name}-${var.environment}"
}

resource "aws_cloudwatch_log_group" "main" {
  name = "awslogs-ecs-${local.project_name}"

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_route53_record" "main" {
  zone_id = var.route53_zone_id
  name    = var.hostname
  type    = "A"

  alias {
    name                   = var.lb_dns
    zone_id                = var.lb_zone_id
    evaluate_target_health = true
  }
}

module "ssl" {
  source = "../ssl"

  hostname        = var.hostname
  route53_zone_id = var.route53_zone_id

  depends_on = [aws_route53_record.main]
}

resource "aws_lb_listener_certificate" "service" {
  listener_arn    = var.lb_listener_arn
  certificate_arn = module.ssl.certificate_arn

  depends_on = [module.ssl]
}

resource "random_string" "default" {
  length  = 16
  special = false
  upper   = false
}

resource "aws_s3_bucket" "pipeline" {
  bucket        = "${local.project_name}-${random_string.default.result}"
  acl           = "private"
  force_destroy = true
}

module "codebuild" {
  source = "./codebuild"

  project_name   = local.project_name
  image_name     = var.image_name
  container_name = var.container_name
  ecr_repo_url   = var.ecr_repo_url
  s3_bucket_arn  = aws_s3_bucket.pipeline.arn
  ecr_repo_arn   = var.ecr_repo_arn
}

module "codepipeline" {
  source = "./codepipeline"

  project_name   = local.project_name
  cluster_name   = var.cluster_name
  service_name   = aws_ecs_service.main.name
  image_name     = var.image_name
  container_name = var.container_name
  ecr_repo_url   = var.ecr_repo_url
  s3_bucket_arn  = aws_s3_bucket.pipeline.arn
  s3_bucket_name = aws_s3_bucket.pipeline.bucket

  codebuild_project_name = module.codebuild.project_name

  github_username = var.github_username
  github_repo     = var.github_repo
  github_branch   = var.github_branch
  github_token    = var.github_token

  codebuild_project_arn = module.codebuild.arn
}

resource "aws_ecs_task_definition" "main" {
  family                   = "${var.app_name}-${local.project_name}"
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.task_execution.arn
  cpu                      = var.cpu
  memory                   = var.memory
  requires_compatibilities = ["FARGATE"]

  container_definitions = templatefile("${path.module}/task-definition.json", {
    container_name                  = "${var.app_name}_${var.service_name}"
    ecr_repo_url                    = var.ecr_repo_url
    tag                             = "latest"
    aws_cloudwatch_log_group_region = var.region
    aws_cloudwatch_log_group_name   = aws_cloudwatch_log_group.main.name
    service_name                    = var.service_name
    port                            = var.port
    cpu                             = var.cpu
    memory                          = var.memory
    secret_arn                      = var.secrets_manager_arn
    secret_keys                     = var.secret_keys
    env_vars                        = var.env_vars
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_ecs_service" "main" {
  name                       = var.service_name
  cluster                    = var.cluster_id
  task_definition            = aws_ecs_task_definition.main.arn
  desired_count              = var.instance_count_desired
  deployment_maximum_percent = 250
  launch_type                = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.main.id]
    subnets          = var.subnet_ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.container_name
    container_port   = var.port
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_security_group" "main" {
  name   = "${local.project_name}-sg"
  vpc_id = var.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = var.port
    to_port         = var.port
    cidr_blocks     = ["0.0.0.0/0"]
    security_groups = [var.lb_security_group_id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}