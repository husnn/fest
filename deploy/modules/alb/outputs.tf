output "id" {
  value = aws_lb.main.id
}

output "dns" {
  value = aws_lb.main.dns_name
}

output "zone_id" {
  value = aws_lb.main.zone_id
}

output "https_listener_arn" {
  value = length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : aws_lb_listener.http.arn
}

output "security_group_id" {
  value = aws_security_group.lb.id
}
