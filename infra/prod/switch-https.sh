#!/usr/bin/env bash
# Перевод стенда на канонический адрес https://95.47.96.14:4440.
# Меняются: CORS всех трёх видов, база ссылок на фото, публичный origin витрины.
set -euo pipefail
cd "$(dirname "$0")"
say() { printf '\n== %s\n' "$*"; }

NEW="https://95.47.96.14:4440"

say "Правлю .env"
for k in PUBLIC_ORIGIN STORE_CORS ADMIN_CORS AUTH_CORS STATIC_BASE_URL; do
  awk -v k="$k" -v v="$NEW" 'BEGIN{FS=OFS="="} $1==k {print k "=" v; next} {print}' .env > .env.tmp
  mv .env.tmp .env
done
grep -E "^(PUBLIC_ORIGIN|STORE_CORS|ADMIN_CORS|AUTH_CORS|STATIC_BASE_URL)=" .env

set -a; . ./.env; set +a

say "Пересоздаю бэкенд с новым окружением"
docker compose up -d backend
for i in $(seq 1 40); do
  h=$(docker compose ps --format '{{.Health}}' backend | head -1)
  [ "$h" = "healthy" ] && break
  sleep 5
done
echo "бэкенд: ${h:-?}"
[ "${h:-}" = "healthy" ] || { docker compose logs --tail=30 backend; exit 1; }

say "Переписываю ссылки на фото товаров под новый адрес"
docker compose exec -T backend sh -lc "cd /app && npx medusa exec ./src/scripts/seed-demo-showcase.ts < /dev/null" 2>&1 | tail -6

say "Пересобираю витрину под новый origin"
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
docker compose build storefront
docker compose up -d storefront nginx

say "Состояние"
docker compose ps --format '{{.Service}}\t{{.State}}\t{{.Health}}'
say "ГОТОВО-HTTPS"
