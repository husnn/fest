locals {
  project_name = "${var.app_name}-${var.environment}"
}

data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

resource "aws_security_group" "main" {
  name   = "${local.project_name}-sg"
  vpc_id = var.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["${chomp(data.http.myip.body)}/32"]
  }

  ingress {
    protocol    = "tcp"
    from_port   = var.port
    to_port     = var.port
    cidr_blocks = ["${chomp(data.http.myip.body)}/32"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "main" {
  name               = "${local.project_name}-ec2-role"
  assume_role_policy = file("${path.module}/role.json")
}

resource "aws_iam_instance_profile" "main" {
  name = "${local.project_name}-ec2-profile"
  role = aws_iam_role.main.name
}

resource "aws_instance" "main" {
  ami           = "ami-01efa4023f0f3a042"
  instance_type = var.instance_type

  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.main.id]
  associate_public_ip_address = true

  iam_instance_profile = aws_iam_instance_profile.main.name

  key_name = var.ssh_key_name

  root_block_device {
    volume_type           = "gp2"
    volume_size           = 10
    delete_on_termination = true
  }

  tags = {
    Name = local.project_name
  }
}
