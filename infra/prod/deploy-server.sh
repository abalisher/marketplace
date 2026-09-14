#!/usr/bin/env bash
# Развёртывание стенда НА СЕРВЕРЕ. Запускается из каталога infra/prod
# доставленного репозитория: bash deploy-server.sh
#
# Порядок шагов не произволен: витрина вшивает публикуемый ключ в бандл на
# сборке, а ключ появляется только после инициализации магазина на живой базе.
# Поэтому сначала поднимается бэкенд с базой, потом наполняется магазин, и лишь
# затем собирается витрина.
#
# Скрипт идемпотентен — повторный запуск догоняет состояние, не ломая данные:
# .env не перезаписывается, сиды и создание учёток идемпотентны сами.
set -euo pipefail

cd "$(dirname "$0")"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

# --- Шаг 0. Окружение. Секреты генерируются один раз, при создании .env. ---
if [ ! -f .env ]; then
  say "Создаю .env (секреты генерируются)"
  cp .env.example .env
  gen() { openssl rand -hex 32; }
  set_env() {
    # Значение подставляется через awk, а не sed: в секретах и адресах
    # встречаются слэши и амперсанды, на которых sed-замена ломается.
    awk -v key="$1" -v val="$2" \
      'BEGIN{FS=OFS="="} $1==key {print key "=" val; next} {print}' .env > .env.tmp
    mv .env.tmp .env
  }
  set_env POSTGRES_PASSWORD "$(gen)"
  set_env JWT_SECRET "$(gen)"
  set_env COOKIE_SECRET "$(gen)"
  set_env REVALIDATE_SECRET "$(gen)"
  set_env ADMIN_PASSWORD "$(openssl rand -base64 12 | tr -d '/+=' )"
  set_env SELLER_PASSWORD "$(openssl rand -base64 12 | tr -d '/+=' )"
  set_env PICKER_PASSWORD "$(openssl rand -base64 12 | tr -d '/+=' )"
  echo "Секреты и пароли учёток записаны в infra/prod/.env"
  echo "ВНИМАНИЕ: GEMINI_API_KEY пуст — ассистент и разбор накладных не заработают,"
  echo "          пока ключ не вписан в .env (потом: docker compose up -d backend)."
else
  echo ".env уже есть — оставляю как есть"
fi

# Новые переменные из .env.example доезжают до УЖЕ СУЩЕСТВУЮЩЕГО .env. Иначе
# переменная, добавленная в шаблон (так было с TUNNEL_RUN), на работающем
# сервере не появляется никогда: файл не перезаписывается, а set-env.sh правит
# только существующие строки и на отсутствующую отвечает отказом.
# Добавляются ТОЛЬКО недостающие ключи и только со значением из шаблона —
# заполненные на сервере значения не трогаются.
added=""
while IFS= read -r line; do
  case "$line" in
    ''|'#'*) continue ;;
    *=*) ;;
    *) continue ;;
  esac
  key=${line%%=*}
  if ! grep -q "^$key=" .env; then
    printf '%s\n' "$line" >> .env
    added="${added:+$added, }$key"
  fi
done < .env.example
if [ -n "$added" ]; then
  echo "В .env добавлены новые переменные из шаблона: $added"
fi

set -a; . ./.env; set +a

# --- Шаг 1. Бэкенд: образ, база, миграции. ---
say "Собираю образ бэкенда (компиляция + бандл панели)"
docker compose build backend

say "Поднимаю базу и Redis"
docker compose up -d postgres redis

say "Жду готовности базы"
for _ in $(seq 1 40); do
  db_state=$(docker compose ps --format '{{.Health}}' postgres 2>/dev/null | head -1)
  [ "$db_state" = "healthy" ] && break
  sleep 3
done
if [ "${db_state:-}" != "healthy" ]; then
  echo "Postgres не стал healthy. Логи:" >&2
  docker compose logs --tail=40 postgres >&2
  exit 1
fi

# Миграции идут ОДНОРАЗОВЫМ контейнером, до подъёма сервиса. Порядок именно
# такой, потому что Medusa не стартует на базе без таблиц: загрузчики модулей
# (Tax, Payment) сразу падают на `relation "tax_provider" does not exist`, и
# сервис уходит в цикл перезапуска. Ждать `healthy` бэкенда до миграций —
# заведомая петля.
#
# ЗНАЙ ПРО ЭТОТ ШАГ: в контейнере `db:migrate` ЗАВИСАЕТ (2026-09-08) — после
# «Running migrations...» управление уходит в `MedusaAppMigrateUp` и не
# возвращается, не применив ни одной миграции. Поэтому здесь жёсткий таймаут, а
# при его срабатывании — указание на рабочий обход. Подробности замера и обход —
# scripts/migrate-remote.sh.
say "Миграции"
migrations_applied=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -tAc "select count(*) from mikro_orm_migrations" 2>/dev/null | tr -d '[:space:]')
if [ "${migrations_applied:-0}" -gt 0 ]; then
  echo "— миграции уже применены ($migrations_applied), пропускаю"
elif timeout 900 docker compose run --rm backend \
    sh -lc "cd /app && npx medusa db:migrate --execute-safe-links < /dev/null"; then
  echo "миграции применены"
else
  cat <<'HINT' >&2

Миграции в контейнере не прошли (известное зависание `db:migrate`).
Рабочий путь — с машины разработчика, через ssh-туннель:

    bash scripts/migrate-remote.sh

После него запустите этот скрипт повторно: он увидит применённые миграции,
пропустит шаг и продолжит с наполнения магазина.
HINT
  exit 1
fi

say "Поднимаю бэкенд"
docker compose up -d backend

say "Жду готовности бэкенда"
for _ in $(seq 1 60); do
  state=$(docker compose ps --format '{{.Health}}' backend 2>/dev/null | head -1)
  [ "$state" = "healthy" ] && break
  sleep 5
done
if [ "${state:-}" != "healthy" ]; then
  echo "Бэкенд не стал healthy. Логи:" >&2
  docker compose logs --tail=60 backend >&2
  exit 1
fi

# Обслуживающие команды идут из /app по TypeScript-исходнику — ровно те, что
# описаны в CLAUDE.md.
be() { docker compose exec -T backend sh -lc "cd /app && $1"; }

# Фотографии каталога кладём в том загрузок ДО сида товаров: сид ставит на них
# абсолютные ссылки через /media/:file, а сам файлов не приносит (backend/static
# лежит вне git).
if [ -d ./media ] && [ -n "$(ls -A ./media 2>/dev/null)" ]; then
  say "Фотографии каталога в том загрузок"
  docker compose cp ./media/. backend:/app/.medusa/server/static/
  echo "перенесено файлов: $(ls -1 ./media | wc -l)"
fi

# --- Шаг 2. Наполнение магазина. ---
say "Инициализация магазина: канал продаж + публикуемый ключ"
bootstrap_out=$(be "npx medusa exec ./src/scripts/bootstrap-store.ts" | tee /dev/stderr)
publishable_key=$(printf '%s' "$bootstrap_out" | grep -oE 'PUBLISHABLE_KEY=pk_[A-Za-z0-9_-]+' | tail -1 | cut -d= -f2)
if [ -z "$publishable_key" ]; then
  echo "Не удалось получить публикуемый ключ — витрину собирать нельзя" >&2
  exit 1
fi
echo "Публикуемый ключ: $publishable_key"

say "Каталог: регион KZ, склады, категории, доставка"
be "npx medusa exec ./src/scripts/seed-kz.ts"

say "Каталог: товары с фотографиями"
be "npx medusa exec ./src/scripts/seed-demo-showcase.ts"

say "Учётки панели"
# `medusa user` падает, если пользователь уже есть — для повторного запуска это
# норма, а не ошибка.
be "npx medusa user -e '$ADMIN_EMAIL' -p '$ADMIN_PASSWORD'" || echo "— админ уже есть"
be "npx medusa exec ./src/scripts/create-seller-user.ts"
be "npx medusa exec ./src/scripts/create-picker-users.ts"

# Ссылки на файлы — под текущий адрес стенда. Шаг обязателен ПОСЛЕ сидов и
# на КАЖДОМ развёртывании: фото товаров и PDF документов хранятся в базе
# абсолютными ссылками, поэтому смена адреса (set-origin.sh) без этого шага
# оставляет их указывать на прежний origin — молча, без ошибок в логе.
# Идемпотентен: когда адрес не менялся, отчитывается нулями.
say "Выравниваю ссылки на файлы под адрес стенда"
be "npx medusa exec ./src/scripts/rebase-media-urls.ts"

# --- Шаг 3. Витрина: ключ в .env, сборка, подъём вместе с nginx. ---
say "Вшиваю публикуемый ключ в окружение витрины"
awk -v val="$publishable_key" \
  'BEGIN{FS=OFS="="} $1=="NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" {print $1 "=" val; next} {print}' \
  .env > .env.tmp && mv .env.tmp .env
# Экспорт ОБЯЗАТЕЛЕН, и записи в .env недостаточно: в начале скрипта файл был
# прочитан через `set -a` с ещё пустым ключом, а при подстановке переменных
# Compose переменные окружения ПРИОРИТЕТНЕЕ файла .env — пустая экспортированная
# переменная перебивает свежее значение, и сборка витрины падает на
# «Missing required environment variables: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY».
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="$publishable_key"

say "Собираю образ витрины"
docker compose build storefront

# Сертификат нужен nginx'у на старте: без файлов в tls/ контейнер не поднимется
# вовсе. Выпускаем только если его нет — перевыпуск на каждом развёртывании
# сбрасывал бы исключение, которое посетитель уже сделал в браузере для
# запасного входа по IP. Адреса скрипт берёт сам: домен из PUBLIC_ORIGIN + IP.
if [ ! -s tls/stand.crt ] || [ ! -s tls/stand.key ]; then
  say "Выпускаю самоподписанный сертификат"
  bash make-tls-cert.sh
fi

say "Поднимаю витрину и nginx"
docker compose up -d

say "Состояние"
docker compose ps

say "Проверка входа"
# Проверяем по HTTPS: http отдаёт только редирект (по нему стенд не работает —
# cookie с флагом Secure не выставляются). --no-check-certificate потому, что
# сертификат самоподписанный.
for path in /health /app /picker/ /; do
  code=$(docker compose exec -T nginx sh -lc "wget -qS --no-check-certificate -O /dev/null https://127.0.0.1$path 2>&1 | awk '/HTTP\//{print \$2; exit}'" || true)
  printf '  %-12s → %s\n' "$path" "${code:-нет ответа}"
done

cat <<INFO

Готово. Снаружи стенд открывается по $PUBLIC_ORIGIN
  витрина покупателя  $PUBLIC_ORIGIN/
  панель продавца     $PUBLIC_ORIGIN/app
  окно сборщика       $PUBLIC_ORIGIN/picker/

Запасной вход (постоянный, но с предупреждением о сертификате):
  https://95.47.96.14:4440

Учётки — в infra/prod/.env (ADMIN_*, SELLER_*, PICKER_PASSWORD).
INFO

# Режим туннеля виден только здесь: перепутать постоянный адрес со случайным
# слишком легко, а наружу они выглядят одинаково.
if [ -n "${TUNNEL_RUN:-}" ]; then
  echo "Туннель: именованный (постоянный адрес $PUBLIC_ORIGIN)"
else
  echo "Туннель: быстрый, адрес СЛУЧАЙНЫЙ и меняется при перезапуске —"
  echo "  docker compose logs tunnel | grep trycloudflare.com"
  echo "  Постоянный адрес на домене: см. раздел «Домен» в infra/prod/README.md"
fi
