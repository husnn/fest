resource "aws_route53_record" "root_staging" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "staging"
  type    = "A"

  ttl     = 3600
  records = var.a_records_root
}

module "s3_media_staging" {
  source = "./modules/s3"

  name = "${var.app_name}-media-staging"
  allowed_origins = [
    "https://staging.${var.domain_name}"
  ]
}
