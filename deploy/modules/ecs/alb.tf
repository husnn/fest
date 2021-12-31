resource "aws_lb_target_group" "main" {
  name        = "${local.project_name}-alb-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  stickiness {
    enabled = var.use_sticky_sessions
    type    = "lb_cookie"
  }

  health_check {
    healthy_threshold   = "3"
    interval            = "20"
    protocol            = "HTTP"
    matcher             = "200-299"
    timeout             = "5"
    path                = var.health_check_path
    unhealthy_threshold = "3"
  }
}

resource "aws_lb_listener_rule" "main" {
  listener_arn = var.lb_listener_arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  condition {
    host_header {
      values = [var.hostname]
    }
  }
}
