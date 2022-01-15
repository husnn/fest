resource "aws_acm_certificate" "main2" {
  domain_name       = var.host
  validation_method = "DNS"
  subject_alternative_names = [
    "api.${var.host}",
    "house.${var.host}",
  ]
}

resource "aws_route53_record" "ssl2" {
  for_each = {
    for dvo in aws_acm_certificate.main2.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.primary.zone_id
}

resource "aws_acm_certificate_validation" "main2" {
  certificate_arn         = aws_acm_certificate.main2.arn
  validation_record_fqdns = [for record in aws_route53_record.ssl2 : record.fqdn]
}
