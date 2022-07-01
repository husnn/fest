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
  -e NODE_ENV="$NODE_ENV" \
  -e SECRET="$SECRET" \
  -e REDIS_URL="$REDIS_URL" \
  -e ETH_PROVIDER="$ETH_PROVIDER" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e DISCORD_CLIENT_ID="$DISCORD_CLIENT_ID" \
  -e DISCORD_CLIENT_SECRET="$DISCORD_CLIENT_SECRET" \
  -e DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
  -p 9000:9000 --restart unless-stopped \
  -idt $ECR_IMAGE_URL yarn indexer serve

sudo docker run \
  -e NODE_ENV="$NODE_ENV" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e CLIENT_URL="$CLIENT_URL" \
  -e MAIL_FROM_NO_REPLY="$MAIL_FROM_NO_REPLY" \
  -e SENDGRID_API_KEY="$SENDGRID_API_KEY" \
  -p 4000:4000 --restart unless-stopped \
  -idt $ECR_IMAGE_URL yarn console serve
