resource "aws_elasticache_subnet_group" "default" {
  name       = "fanbase-cache-subnet"
  subnet_ids = ["${aws_subnet.public_eu_west_1a.id}", "${aws_subnet.public_eu_west_1b.id}"]
}

resource "aws_elasticache_cluster" "default" {
  cluster_id = "redis-cluster"

  engine               = "redis"
  engine_version       = "3.2.4"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.default.name
  security_group_ids = [aws_security_group.redis.id]
}
