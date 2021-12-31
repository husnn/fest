resource "aws_iam_role" "main" {
  name = "${var.project_name}-codebuild-role"

  assume_role_policy = file("${path.module}/role.json")
}

resource "aws_iam_role_policy" "main" {
  name = "${var.project_name}-codebuild-policy"
  role = aws_iam_role.main.id

  policy = templatefile("${path.module}/policy.json", {
    s3_bucket_arn = var.s3_bucket_arn
    ecr_repo_arn  = var.ecr_repo_arn
  })
}
