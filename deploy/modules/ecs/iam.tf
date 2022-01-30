resource "aws_iam_role" "task" {
  name               = "${local.project_name}-ecs-role"
  assume_role_policy = file("${path.module}/role.json")
}

resource "aws_iam_role" "task_execution" {
  name               = "${local.project_name}-ecs-execution-role"
  assume_role_policy = file("${path.module}/role.json")
}

resource "aws_iam_role_policy" "task_execution" {
  name = "${local.project_name}-ecs-task-execution-policy"
  role = aws_iam_role.task_execution.id

  policy = file("${path.module}/policy.json")
}

data "aws_iam_policy_document" "secrets_manager" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.secrets_manager_arn]
  }
}

resource "aws_iam_policy" "secrets_manager" {
  count = length(var.secrets_manager_arn) > 0 ? 1 : 0

  name   = "${local.project_name}-ecs-secrets-manager-policy"
  policy = data.aws_iam_policy_document.secrets_manager.json
}

resource "aws_iam_role_policy_attachment" "secrets_manager" {
  count = length(aws_iam_policy.secrets_manager) > 0 ? 1 : 0

  role       = aws_iam_role.task_execution.id
  policy_arn = aws_iam_policy.secrets_manager.0.arn
}
