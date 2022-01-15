[
  {
    "name": "${container_name}",
    "image": "${aws_ecr_repository}:${tag}",
    "command": ["yarn", "api", "serve"],
    "essential": true,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "eu-west-1",
        "awslogs-stream-prefix": "${aws_cloudwatch_log_group_name}-api",
        "awslogs-group": "${aws_cloudwatch_log_group_name}"
      }
    },
    "portMappings": [
      {
        "containerPort": 5000,
        "hostPort": 5000,
        "protocol": "tcp"
      }
    ],
    "cpu": 512,
    "environment": [
      {
        "name": "NODE_ENV",
        "value": "production"
      },
      {
        "name": "PORT",
        "value": "5000"
      },
      {
        "name": "DATABASE_URL",
        "value": "postgres://gqtpzaawbnjaof:f4f77b7757aa5071e41c645dd30a566726e3293c51a3415d2c52e5877b9114c7@ec2-52-208-221-89.eu-west-1.compute.amazonaws.com:5432/d59qrldb8a9ikf"
      },
      {
        "name": "JWT_SECRET",
        "value": "s3creti5S1m0"
      },
      {
        "name": "JWT_EXPIRY",
        "value": "30d"
      },
      {
        "name": "HOUSE_JWT_SECRET",
        "value": "s3creti5S1m0-house"
      },
      {
        "name": "HOUSE_JWT_EXPIRY",
        "value": "30d"
      },
      {
        "name": "ETH_WALLET_ADDRESS",
        "value": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
      },
      {
        "name": "ETH_WALLET_PK",
        "value": "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"
      },
      {
        "name": "ETH_PROVIDER",
        "value": "https://polygon-mumbai.infura.io/v3/ec05c03872e548a4b5e86fd7e020712b"
      },
      {
        "name": "BYPASS_INDEXER_CONNECTION",
        "value": "true"
      },
      {
        "name": "SECRET",
        "value": "hVmYq3t6w9z$C&F)J@McQfTjWnZr4u7x"
      },
      {
        "name": "S3_TOKEN_MEDIA_NAME",
        "value": "fanbase-dev"
      },
      {
        "name": "S3_TOKEN_MEDIA_URL",
        "value": "https://s3.filebase.com"
      },
      {
        "name": "S3_TOKEN_MEDIA_API_KEY",
        "value": "F39B36ED5FD3F01B0B7F"
      },
      {
        "name": "S3_TOKEN_MEDIA_API_SECRET",
        "value": "uP9Wl81KsluS1W3hRMTjjhgQOSOCzMoOJWRX67ur"
      },
      {
        "name": "PINATA_API_KEY",
        "value": "e9f3f0812dd88efda539"
      },
      {
        "name": "PINATA_API_SECRET",
        "value": "baf6f3848c95f7d1f8a943695b30cb61b1ddcc7be638f3437145b7fd4975d9c9"
      }
    ],
    "ulimits": [
      {
        "name": "nofile",
        "softLimit": 65536,
        "hardLimit": 65536
      }
    ],
    "mountPoints": [],
    "memory": 1024,
    "volumesFrom": []
  }
]