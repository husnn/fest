resource "aws_acm_certificate" "main" {
  domain_name               = var.hostname
  validation_method         = "DNS"
  subject_alternative_names = var.use_www ? ["www.${var.hostname}"] : []
}

resource "aws_route53_record" "ssl" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
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
  zone_id         = var.route53_zone_id

  depends_on = [aws_acm_certificate.main]
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.ssl : record.fqdn]

  depends_on = [aws_route53_record.ssl]
}
