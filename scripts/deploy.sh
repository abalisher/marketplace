#!/usr/bin/env bash
# Развёртывание стенда на VPS с машины разработчика: bash scripts/deploy.sh
#
# Транспорт — tar по ssh, а не rsync: в Git Bash на Windows rsync'а нет.
# Хост берётся из ~/.ssh/config (алиас `stroymarket`: 95.47.96.14, порт 2240).
#
# Что делает:
#   1. доставляет исходник бэкенда, витрины и infra/prod на сервер;
#   2. доставляет фотографии каталога (backend/static лежит вне git);
#   3. запускает infra/prod/deploy-server.sh (сборка образов, миграции, сиды);
#   4. собирает окно сборщика (Flutter web) с адресом стенда и доставляет его
#      статикой под /picker/ — Flutter в серверный образ не тянем.
set -euo pipefail

HOST=${DEPLOY_HOST:-stroymarket}
REMOTE_DIR=${DEPLOY_DIR:-stroymarket}
SKIP_PICKER=${SKIP_PICKER:-0}

repo_root=$(cd "$(dirname "$0")/.." && pwd)
cd "$repo_root"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

# --- 1. Исходник. ---
say "Доставляю исходник на $HOST:~/$REMOTE_DIR"
ssh "$HOST" "mkdir -p ~/$REMOTE_DIR"
tar -czf - \
  --exclude='node_modules' \
  --exclude='.medusa' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.cache' \
  --exclude='coverage' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='static' \
  --exclude='uploads' \
  --exclude='scripts/shots' \
  backend storefront infra/prod \
  | ssh "$HOST" "tar -xzf - -C ~/$REMOTE_DIR"

# --- 2. Фотографии каталога. ---
# backend/static в .gitignore, а сид товаров ссылается на эти файлы через
# /media/:file — без них витрина покажет карточки без фото.
say "Доставляю фотографии каталога"
if ls backend/static/img-*.jpg >/dev/null 2>&1; then
  ssh "$HOST" "mkdir -p ~/$REMOTE_DIR/infra/prod/media"
  tar -czf - -C backend/static $(cd backend/static && ls img-*.jpg) \
    | ssh "$HOST" "tar -xzf - -C ~/$REMOTE_DIR/infra/prod/media"
else
  echo "— фотографий backend/static/img-*.jpg нет, пропускаю"
fi

# --- 3. Развёртывание на сервере. ---
say "Запускаю развёртывание на сервере"
ssh "$HOST" "cd ~/$REMOTE_DIR/infra/prod && bash deploy-server.sh"

# --- 4. Окно сборщика. ---
if [ "$SKIP_PICKER" = "1" ]; then
  say "Окно сборщика пропущено (SKIP_PICKER=1)"
  exit 0
fi

say "Собираю окно сборщика (Flutter web)"
remote_env=$(ssh "$HOST" "cat ~/$REMOTE_DIR/infra/prod/.env")
origin=$(printf '%s' "$remote_env" | awk -F= '$1=="PUBLIC_ORIGIN"{print $2; exit}')
pk=$(printf '%s' "$remote_env" | awk -F= '$1=="NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"{print $2; exit}')
if [ -z "$origin" ]; then
  echo "В .env сервера нет PUBLIC_ORIGIN" >&2
  exit 1
fi
echo "Адрес стенда: $origin"

(cd mobile && flutter pub get)
# MSYS_NO_PATHCONV=1 обязателен: Git Bash на Windows превращает аргумент
# `/picker/` в windows-путь, и сборка падает с «Received a --base-href value of
# "C:/Program Files/Git/picker/"».
(cd mobile/apps/partner && MSYS_NO_PATHCONV=1 flutter build web --release \
  --base-href=/picker/ \
  --dart-define=MEDUSA_BASE_URL="$origin" \
  --dart-define=MEDUSA_PUBLISHABLE_KEY="$pk" \
  --dart-define=FEATURE_COMPANIES=false)

say "Доставляю окно сборщика под /picker/"
ssh "$HOST" "mkdir -p ~/$REMOTE_DIR/infra/prod/picker && rm -rf ~/$REMOTE_DIR/infra/prod/picker/*"
tar -czf - -C mobile/apps/partner/build/web . \
  | ssh "$HOST" "tar -xzf - -C ~/$REMOTE_DIR/infra/prod/picker"

say "Готово"
echo "  витрина покупателя  $origin/"
echo "  панель продавца     $origin/app"
echo "  окно сборщика       $origin/picker/"
