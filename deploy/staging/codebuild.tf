resource "aws_iam_role" "ecs_codebuild" {
  name = "ecs-codebuild-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "ecs_codebuild" {
  name = "codebuild-policy"
  role = aws_iam_role.ecs_codebuild.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
       
        {
            "Effect": "Allow",
            "Resource": [
              "${aws_s3_bucket.pipeline.arn}",
              "${aws_s3_bucket.pipeline.arn}/*"
            ],
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:GetBucketAcl",
                "s3:GetBucketLocation"
            ]
        },
        {
          "Effect": "Allow",
          "Resource": [
            "*"
          ],
          "Action": [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecr:CompleteLayerUpload",
                "ecr:GetAuthorizationToken",
                "ecr:UploadLayerPart",
                "ecr:InitiateLayerUpload",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage"
            ],
            "Resource": [
              "${aws_ecr_repository.main.arn}"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetRandomPassword",
                "secretsmanager:GetResourcePolicy",
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecretVersionIds"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_codebuild_project" "main" {
  name          = "ecs-codebuild-main"
  build_timeout = "5"
  service_role  = aws_iam_role.ecs_codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:4.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true

    environment_variable {
      name  = "IMAGE_NAME"
      value = "${var.app_name}_api"
    }

    environment_variable {
      name  = "CONTAINER_NAME"
      value = "${var.app_name}_api"
    }

    environment_variable {
      name  = "ECR_REPO_URL"
      value = aws_ecr_repository.main.repository_url
    }
  }

  source {
    type = "CODEPIPELINE"
  }
}

resource "aws_codebuild_project" "house" {
  name          = "ecs-codebuild-house"
  build_timeout = "5"
  service_role  = aws_iam_role.ecs_codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:4.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true

    environment_variable {
      name  = "IMAGE_NAME"
      value = "${var.app_name}_house"
    }

    environment_variable {
      name  = "CONTAINER_NAME"
      value = "${var.app_name}_house"
    }

    environment_variable {
      name  = "ECR_REPO_URL"
      value = aws_ecr_repository.main.repository_url
    }
  }

  source {
    type = "CODEPIPELINE"
  }
}
