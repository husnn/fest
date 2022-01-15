[
  {
    "name": "${container_name}",
    "image": "${aws_ecr_repository}:${tag}",
    "command": ["yarn", "indexer", "serve"],
    "essential": true,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "eu-west-1",
        "awslogs-stream-prefix": "${aws_cloudwatch_log_group_name}-indexer",
        "awslogs-group": "${aws_cloudwatch_log_group_name}"
      }
    },
    "portMappings": [
      {
        "containerPort": 9000,
        "hostPort": 9000,
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
        "value": "9000"
      },
      {
        "name": "DATABASE_URL",
        "value": "postgres://gqtpzaawbnjaof:f4f77b7757aa5071e41c645dd30a566726e3293c51a3415d2c52e5877b9114c7@ec2-52-208-221-89.eu-west-1.compute.amazonaws.com:5432/d59qrldb8a9ikf"
      },
      {
        "name": "REDIS_URL",
        "value": "redis://${redis_host}:${redis_port}"
      },
      {
        "name": "ETH_PROVIDER",
        "value": "https://polygon-mumbai.infura.io/v3/ec05c03872e548a4b5e86fd7e020712b"
      },
      {
        "name": "SECRET",
        "value": "hVmYq3t6w9z$C&F)J@McQfTjWnZr4u7x"
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