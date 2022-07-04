#!/bin/bash
docker run --name fest_redis -p 6390:6379 --restart=unless-stopped -d redis