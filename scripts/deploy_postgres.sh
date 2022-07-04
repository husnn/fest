#!/bin/bash
docker run --name fest_postgres -e POSTGRES_PASSWORD=postgres -p 5430:5432 --restart=unless-stopped -d postgres