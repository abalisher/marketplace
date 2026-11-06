#!/bin/bash
set -e
cd /home/administrator/stroymarket/infra/prod
set -a; . ./.env; set +a
export BUILDKIT_PROGRESS=plain

echo "=== Building backend ==="
docker compose build backend

echo "=== Restarting backend ==="
docker compose up -d backend

echo "=== Waiting for backend healthy ==="
for i in $(seq 1 40); do
  state=$(docker compose ps --format '{{.Health}}' backend 2>/dev/null | head -1)
  echo "Backend state: $state ($i/40)"
  [ "$state" = "healthy" ] && break
  sleep 3
done

echo "=== Building storefront ==="
docker compose build storefront

echo "=== Restarting storefront ==="
docker compose up -d storefront

echo "=== Recreating nginx ==="
docker compose up -d --force-recreate nginx

echo "=== Status ==="
docker compose ps
