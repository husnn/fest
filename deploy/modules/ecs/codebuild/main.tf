resource "aws_codebuild_project" "main" {
  name          = "${var.project_name}-build"
  build_timeout = "5"
  service_role  = aws_iam_role.main.arn

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
      name  = "AWS_ACCOUNT_ID"
      value = var.aws_account_id
    }

    environment_variable {
      name  = "IMAGE_NAME"
      value = var.image_name
    }

    environment_variable {
      name  = "CONTAINER_NAME"
      value = var.container_name
    }

    environment_variable {
      name  = "ECR_REPO_URL"
      value = var.ecr_repo_url
    }
  }

  source {
    type = "CODEPIPELINE"
  }
}
