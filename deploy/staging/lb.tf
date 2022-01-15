resource "aws_lb" "public_main" {
  name               = "alb"
  subnets            = [aws_subnet.public_eu_west_1a.id, aws_subnet.public_eu_west_1b.id]
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  idle_timeout       = 600
}

output "aws_lb_dns_name" {
  value = aws_lb.public_main.dns_name
}

resource "aws_lb_listener" "https_forward" {
  load_balancer_arn = aws_lb.public_main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.public_main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.main2.arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Fixed response content"
      status_code  = "200"
    }
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.public_api.arn
  }

  condition {
    host_header {
      values = ["api.*"]
    }
  }
}

resource "aws_lb_listener_rule" "house" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.public_house.arn
  }

  condition {
    host_header {
      values = ["house.*"]
    }
  }
}

resource "aws_lb_target_group" "public_api" {
  name        = "${var.app_name}-api-alb-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200-299"
    timeout             = "120"
    path                = "/v1/init"
    unhealthy_threshold = "10"
  }
}

resource "aws_lb_target_group" "public_house" {
  name        = "${var.app_name}-house-alb-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  stickiness {
    enabled = true
    type    = "lb_cookie"
  }

  health_check {
    healthy_threshold   = "3"
    interval            = "300"
    protocol            = "HTTP"
    matcher             = "200-299"
    timeout             = "120"
    path                = "/"
    unhealthy_threshold = "10"
  }
}
