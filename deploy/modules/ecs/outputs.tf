output "security_group_id" {
  value = aws_security_group.main.id
}

output "task_role_name" {
  value = aws_iam_role.task.name
}
