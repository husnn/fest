output "public_dns" {
  value = aws_instance.main.public_dns
}

output "role_id" {
  value = aws_iam_role.main.id
}

output "security_group_id" {
  value = aws_security_group.main.id
}
