output "name" {
  value = aws_s3_bucket.main.id
}

output "arn" {
  value = aws_s3_bucket.main.arn
}

output "url" {
  value = aws_s3_bucket.main.bucket_domain_name
}

output "url_regional" {
  value = aws_s3_bucket.main.bucket_regional_domain_name
}