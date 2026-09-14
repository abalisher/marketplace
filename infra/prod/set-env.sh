#!/usr/bin/env bash
# Правка одного значения в infra/prod/.env со скрытым вводом + перезапуск
# затронутых сервисов. Нужен, чтобы секрет не попадал ни в историю команд, ни в
# переписку: значение читается с терминала и сразу уходит в файл.
#
# Запуск (с машины разработчика):
#   ssh -t stroymarket 'cd ~/stroymarket/infra/prod && bash set-env.sh GEMINI_API_KEY'
#
# Значения, которые витрина вшивает в бандл на СБОРКЕ (PUBLIC_ORIGIN,
# FEATURE_COMPANIES, публикуемый ключ), этим скриптом менять недостаточно —
# витрину придётся пересобрать: docker compose build storefront && docker compose up -d storefront
set -euo pipefail

cd "$(dirname "$0")"

key=${1:-}
if [ -z "$key" ]; then
  echo "Использование: bash set-env.sh ИМЯ_ПЕРЕМЕННОЙ" >&2
  exit 1
fi
if [ ! -f .env ]; then
  echo ".env не найден — сначала прогоните deploy-server.sh" >&2
  exit 1
fi
if ! grep -q "^$key=" .env; then
  echo "В .env нет строки $key= — проверьте имя переменной" >&2
  exit 1
fi

printf 'Значение для %s (ввод скрыт): ' "$key"
IFS= read -rs value
echo
if [ -z "$value" ]; then
  echo "Пустое значение — ничего не менял" >&2
  exit 1
fi

# Значение с пробелами ОБЯЗАНО быть в кавычках. Причина: deploy-server.sh
# читает .env через `source`, и незакавыченное `KEY=два слова` bash понимает
# как присваивание KEY=два плюс запуск команды «слова» — развёртывание падало
# на «--token: command not found» (найдено 2026-09-11 на TUNNEL_RUN).
# Docker Compose кавычки снимает сам, так что обеим сторонам такой формат
# подходит.
case "$value" in
  *[[:space:]]*)
    case "$value" in
      \"*\") ;;                       # уже закавычено — не дублируем
      *) value="\"$value\"" ;;
    esac
    ;;
esac

# awk, а не sed: в ключах и адресах встречаются слэши и амперсанды, на которых
# sed-замена ломается.
awk -v k="$key" -v v="$value" \
  'BEGIN{FS=OFS="="} $1==k {print k "=" v; next} {print}' .env > .env.tmp
mv .env.tmp .env
chmod 600 .env
echo "$key записан (длина значения: ${#value})"

# Окружение читается при СОЗДАНИИ контейнера, поэтому up -d (пересоздаст), а не
# restart — иначе сервис поднимется со старым значением.
echo "Пересоздаю бэкенд с новым окружением…"
docker compose up -d backend
docker compose ps --format '{{.Service}}\t{{.State}}\t{{.Health}}' backend
