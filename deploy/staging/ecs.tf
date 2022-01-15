resource "aws_ecs_task_definition" "api" {
  family                   = "${var.app_name}-api-${var.environment}"
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  container_definitions = templatefile("task-definitions/api.json.tpl", {
    aws_ecr_repository            = aws_ecr_repository.main.repository_url
    tag                           = "latest"
    container_name                = "${var.app_name}_api"
    aws_cloudwatch_log_group_name = aws_cloudwatch_log_group.ecs_main.name
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_ecs_service" "api" {
  name                       = "api"
  cluster                    = aws_ecs_cluster.prod.id
  task_definition            = aws_ecs_task_definition.api.arn
  desired_count              = 2
  deployment_maximum_percent = 250
  launch_type                = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = [aws_subnet.public_eu_west_1a.id, aws_subnet.public_eu_west_1b.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.public_api.arn
    container_name   = "${var.app_name}_api"
    container_port   = 5000
  }

  depends_on = [aws_lb_listener.main, aws_iam_role_policy.ecs_task_execution_role]

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# House
resource "aws_ecs_task_definition" "house" {
  family                   = "${var.app_name}-house-${var.environment}"
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["FARGATE"]
  container_definitions = templatefile("task-definitions/house.json.tpl", {
    aws_ecr_repository            = aws_ecr_repository.main.repository_url
    tag                           = "latest"
    container_name                = "${var.app_name}_house"
    redis_host                    = aws_elasticache_cluster.default.cache_nodes.0.address
    redis_port                    = 6379
    aws_cloudwatch_log_group_name = aws_cloudwatch_log_group.ecs_main.name
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_ecs_service" "house" {
  name                       = "house"
  cluster                    = aws_ecs_cluster.prod.id
  task_definition            = aws_ecs_task_definition.house.arn
  desired_count              = 2
  deployment_maximum_percent = 250
  launch_type                = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = [aws_subnet.public_eu_west_1a.id, aws_subnet.public_eu_west_1b.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.public_house.arn
    container_name   = "${var.app_name}_house"
    container_port   = 6000
  }

  depends_on = [aws_lb_listener.main, aws_iam_role_policy.ecs_task_execution_role]

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# Indexer
resource "aws_ecs_task_definition" "indexer" {
  family                   = "${var.app_name}-indexer-${var.environment}"
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  cpu                      = 512
  memory                   = 1024
  requires_compatibilities = ["EC2"]
  container_definitions = templatefile("task-definitions/indexer.json.tpl", {
    aws_ecr_repository            = aws_ecr_repository.main.repository_url
    tag                           = "latest"
    container_name                = "${var.app_name}_indexer"
    redis_host                    = aws_elasticache_cluster.default.cache_nodes.0.address
    redis_port                    = 6379
    aws_cloudwatch_log_group_name = aws_cloudwatch_log_group.ecs_main.name
  })

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_ecs_service" "indexer" {
  name                       = "indexer"
  cluster                    = aws_ecs_cluster.prod.id
  task_definition            = aws_ecs_task_definition.indexer.arn
  desired_count              = 1
  deployment_maximum_percent = 250
  scheduling_strategy        = "DAEMON"
  launch_type                = "EC2"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = [aws_subnet.public_eu_west_1a.id, aws_subnet.public_eu_west_1b.id]
  }

  depends_on = [aws_iam_role_policy.ecs_task_execution_role]

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_ecs_cluster" "prod" {
  name = "prod"
}
