resource "aws_iam_role" "main" {
  name = "${var.project_name}-codepipeline-role"

  assume_role_policy = file("${path.module}/role.json")
}

resource "aws_iam_role_policy" "main" {
  name = "${var.project_name}-codepipeline-policy"
  role = aws_iam_role.main.id

  policy = templatefile("${path.module}/policy.json", {
    s3_bucket_arn         = var.s3_bucket_arn
    codebuild_project_arn = var.codebuild_project_arn
  })
}
