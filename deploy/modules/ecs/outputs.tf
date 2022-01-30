output "security_group_id" {
  value = aws_security_group.main.id
}

output "exec_role_name" {
  value = aws_iam_role.task_execution.name
}
