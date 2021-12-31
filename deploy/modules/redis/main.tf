locals {
  redis_url = "redis://${aws_elasticache_cluster.main.cache_nodes.0.address}:${aws_elasticache_cluster.main.cache_nodes.0.port}"
}

resource "aws_security_group" "main" {
  name   = "${var.name}-redis-${var.environment}"
  vpc_id = var.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = 6379
    to_port         = 6379
    cidr_blocks     = ["0.0.0.0/0"]
    security_groups = var.allowed_security_group_ids
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id = "${var.name}-redis-${var.environment}"

  engine               = "redis"
  engine_version       = "3.2.4"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  port                 = 6379

  subnet_group_name  = var.subnet_group_name
  security_group_ids = [aws_security_group.main.id]
}
