resource "aws_route53_zone" "primary" {
  name = var.host
}

resource "aws_route53_record" "vercel" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = ""
  type    = "A"

  ttl     = 3600
  records = ["${var.vercel_ip}"]
}

resource "aws_route53_record" "vercel_www" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www"
  type    = "CNAME"

  ttl     = 3600
  records = ["cname.vercel-dns.com"]
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "api.${var.host}"
  type    = "A"

  alias {
    name                   = aws_lb.public_main.dns_name
    zone_id                = aws_lb.public_main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "house" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "house.${var.host}"
  type    = "A"

  alias {
    name                   = aws_lb.public_main.dns_name
    zone_id                = aws_lb.public_main.zone_id
    evaluate_target_health = true
  }
}
