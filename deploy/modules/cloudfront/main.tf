terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 1.0"
    }
  }
}

locals {
  hostname  = "${var.subdomain}.${var.hostname}"
  origin_id = var.name
}

module "ssl" {
  source = "../ssl"

  hostname        = local.hostname
  route53_zone_id = var.route53_zone_id
}

resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = var.origin_host
    origin_path = var.origin_path
    origin_id   = local.origin_id
  }

  enabled = true

  aliases = [local.hostname]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = module.ssl.certificate_arn
    ssl_support_method  = "sni-only"
  }

  price_class = "PriceClass_All"

  tags = {
    Environment = var.environment
  }
}

resource "aws_route53_record" "main" {
  zone_id = var.route53_zone_id
  name    = local.hostname
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = true
  }
}
