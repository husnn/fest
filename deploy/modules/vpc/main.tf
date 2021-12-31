resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "private" {
  for_each = { for i, zone in var.availability_zones : i => zone }

  vpc_id = aws_vpc.main.id

  cidr_block        = "10.0.${128 + each.key}.0/24"
  availability_zone = each.value
}

resource "aws_subnet" "public" {
  for_each = { for i, zone in var.availability_zones : i => zone }

  vpc_id = aws_vpc.main.id

  cidr_block        = "10.0.${1 + each.key}.0/24"
  availability_zone = each.value
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}
