#!/usr/bin/env bash
# Смена публичного адреса стенда одной командой.
#
# Зачем отдельный скрипт. Адрес стенда размазан по .env пятью строками
# (PUBLIC_ORIGIN, три CORS'а и STATIC_BASE_URL), вшивается в бандл витрины на
# СБОРКЕ и вдобавок лежит абсолютными ссылками в базе — у фото товаров и PDF
# документов. Поправить руками одну строку и получить наполовину переехавший
# стенд слишком легко, поэтому все пять правок и напоминание о пересборке
# собраны здесь.
#
# Запуск на сервере:
#   cd ~/stroymarket/infra/prod && bash set-origin.sh https://stand.example.com
#
# После него ОБЯЗАТЕЛЬНО (иначе переезд неполный):
#   bash deploy-server.sh      # пересоберёт витрину и выровняет ссылки в базе
# либо с машины разработчика `bash scripts/deploy.sh` — он заодно пересоберёт
# окно сборщика, в которое адрес стенда тоже вшит.
set -euo pipefail

cd "$(dirname "$0")"

origin=${1:-}
if [ -z "$origin" ]; then
  cat <<'USAGE' >&2
Использование: bash set-origin.sh <адрес стенда>

  bash set-origin.sh https://stand.example.com    # домен через туннель
  bash set-origin.sh https://95.47.96.14:4440     # вход по IP
USAGE
  exit 1
fi
if [ ! -f .env ]; then
  echo ".env не найден — сначала прогоните deploy-server.sh" >&2
  exit 1
fi

# Адрес должен быть ORIGIN'ом: схема + хост (+ порт), без пути и без слэша на
# конце. Из него склеиваются ссылки на файлы, а `https://x/` дало бы `https://x//media/…`.
if ! printf '%s' "$origin" | grep -qE '^https?://[A-Za-z0-9._-]+(:[0-9]+)?$'; then
  echo "Адрес должен быть вида https://имя[:порт], без пути: получено «$origin»" >&2
  exit 1
fi
if [ "${origin#https://}" = "$origin" ]; then
  # Не запрещаем, но предупреждаем: по http стенд не работает по существу.
  echo "ВНИМАНИЕ: адрес не https. Вход в панель и вход покупателя по телефону" >&2
  echo "          не работают по http (cookie с флагом Secure), микрофона нет." >&2
fi

current=$(awk -F= '$1=="PUBLIC_ORIGIN"{print $2; exit}' .env)
echo "Было:  ${current:-<пусто>}"
echo "Стало: $origin"

set_env() {
  # awk, а не sed: в адресах есть слэши, на которых sed-замена ломается.
  awk -v k="$1" -v v="$2" \
    'BEGIN{FS=OFS="="} $1==k {print k "=" v; next} {print}' .env > .env.tmp
  mv .env.tmp .env
}

# CORS: новый адрес ДОБАВЛЯЕТСЯ к уже перечисленным, а не заменяет их. Так
# переживает запасной вход — после переезда на домен стенд остаётся открываемым
# и по https://95.47.96.14:4440, и старые вкладки не отваливаются с ошибкой CORS.
merge_cors() {
  local key=$1
  local existing
  existing=$(awk -F= -v k="$key" '$1==k{print $2; exit}' .env)
  local merged="$origin"
  local IFS=,
  for item in $existing; do
    [ -z "$item" ] && continue
    [ "$item" = "$origin" ] && continue
    merged="$merged,$item"
  done
  set_env "$key" "$merged"
}

set_env PUBLIC_ORIGIN "$origin"
set_env STATIC_BASE_URL "$origin"
merge_cors STORE_CORS
merge_cors ADMIN_CORS
merge_cors AUTH_CORS
chmod 600 .env

echo
echo ".env обновлён:"
grep -E '^(PUBLIC_ORIGIN|STATIC_BASE_URL|STORE_CORS|ADMIN_CORS|AUTH_CORS)=' .env | sed 's/^/  /'

cat <<'NEXT'

Осталось два шага — без них переезд неполный:

  1. bash deploy-server.sh
     Пересоберёт витрину (NEXT_PUBLIC_* вшиваются на сборке, рестарта мало)
     и выровняет абсолютные ссылки в базе — фото товаров и PDF документов
     иначе продолжат указывать на прежний адрес и молча перестанут открываться.

  2. Окно сборщика (/picker/) собирается на машине разработчика, адрес стенда
     вшит и в него: bash scripts/deploy.sh с машины разработчика.
NEXT
