output "redis_url" {
  value     = local.redis_url
  sensitive = true
}

output "security_group_id" {
  value = aws_security_group.main.id
}
