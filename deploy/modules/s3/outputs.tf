output "name" {
  value = aws_s3_bucket.main.id
}

output "arn" {
  value = aws_s3_bucket.main.arn
}

output "domain_name" {
  value = aws_s3_bucket.main.bucket_domain_name
}

output "regional_domain_name" {
  value = aws_s3_bucket.main.bucket_regional_domain_name
}
