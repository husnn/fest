#!/bin/bash

# Make sure IAM role has the following permissions:
#   ecr:BatchGetImage
#   ecr:GetAuthorizationToken
#   ecr:GetDownloadUrlForLayer
#   secretsmanager:GetSecretValue

# Set AWS_SECRET_ID
# Set ECR_IMAGE_URL
# Set DATABASE_URL
# Set REDIS_URL

yum -y install jq docker

aws configure set default.region eu-west-1
$(aws ecr get-login --no-include-email)

$( echo "$(aws secretsmanager get-secret-value --secret-id $AWS_SECRET_ID --query SecretString --output text)" | jq -r 'keys[] as $k | "export \($k)=\(.[$k])"' )

sudo service docker start

sudo docker run \
  -e SECRET="$SECRET" \
  -e REDIS_URL="$REDIS_URL" \
  -e ETH_PROVIDER="$ETH_PROVIDER" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV="production" \
  -p 9000:9000 --restart unless-stopped \
  -idt $ECR_IMAGE_URL yarn indexer serve

docker run \
  -e SECRET="$SECRET" \
  -e REDIS_URL="$REDIS_URL" \
  -e ETH_PROVIDER="$ETH_PROVIDER" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV="production" \
  -p 4000:4000 --restart unless-stopped \
  -idt $ECR_IMAGE_URL yarn console serve
