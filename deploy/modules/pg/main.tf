resource "random_string" "default" {
  length  = 16
  special = false
  upper   = false
}

resource "random_password" "master" {
  length  = 16
  special = false
}

locals {
  user         = var.user
  password     = random_password.master.result
  database_url = "postgres://${local.user}:${local.password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.name}"
}

resource "aws_secretsmanager_secret" "main" {
  name = "${var.environment}/postgres-${var.name}/${random_string.default.result}"
}

resource "aws_secretsmanager_secret_version" "main" {
  secret_id     = aws_secretsmanager_secret.main.id
  secret_string = <<EOF
{
  "USERNAME": "${var.user}",
  "PASSWORD": "${local.password}"
  "URI": "${local.database_url}"
}
EOF
}

resource "aws_security_group" "main" {
  name   = "${var.name}-pg-sg-${var.environment}"
  vpc_id = var.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = 5432
    to_port         = 5432
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

resource "aws_db_instance" "main" {
  identifier = "${var.name}-pg-${var.environment}"

  engine         = "postgres"
  engine_version = "12.9"
  instance_class = "db.t2.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = false

  name     = var.name
  username = var.user
  password = random_password.master.result
  port     = 5432

  db_subnet_group_name   = var.subnet_group_name
  vpc_security_group_ids = [aws_security_group.main.id]

  skip_final_snapshot = true
}
