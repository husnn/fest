resource "aws_cloudwatch_log_group" "ecs_main" {
  name = "awslogs-ecs-main"

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}
