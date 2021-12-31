output "user" {
  value = local.user
}

output "password" {
  value     = local.password
  sensitive = true
}

output "database_url" {
  value     = local.database_url
  sensitive = true
}

output "security_group_id" {
  value = aws_security_group.main.id
}
