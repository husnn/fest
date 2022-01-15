[
  {
    "name": "${container_name}",
    "image": "${aws_ecr_repository}:${tag}",
    "command": ["yarn", "house", "serve"],
    "essential": true,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "eu-west-1",
        "awslogs-stream-prefix": "${aws_cloudwatch_log_group_name}-house",
        "awslogs-group": "${aws_cloudwatch_log_group_name}"
      }
    },
    "portMappings": [
      {
        "containerPort": 6000,
        "hostPort": 6000,
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
        "value": "6000"
      },
      {
        "name": "CLIENT_URL",
        "value": "https://fanbase.lol"
      },
      {
        "name": "REDIS_URL",
        "value": "redis://${redis_host}:${redis_port}"
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