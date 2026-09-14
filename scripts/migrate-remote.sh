#!/usr/bin/env bash
# Миграции базы прод-стенда С МАШИНЫ РАЗРАБОТЧИКА через ssh-туннель.
#
# ПОЧЕМУ НЕ В КОНТЕЙНЕРЕ. `npx medusa db:migrate` внутри контейнера бэкенда
# зависает намертво: после «Running migrations...» управление уходит в
# `MedusaAppMigrateUp` и не возвращается — ни одной миграции не применяется, в
# базе остаётся только таблица `mikro_orm_migrations`. Замерено отладочным
# протоколом Node на зависшем процессе: событийный цикл держат живой сокет к
# Postgres и три таймера, ожидающих запросов нет. Воспроизводится одинаково из
# исходника и из прод-сборки, с `--concurrency 1`, `--skip-links`,
# `--skip-scripts`, при NODE_ENV=production и development. При этом
# `medusa exec` и сам сервер в том же контейнере работают нормально — сломан
# только миграционный проход (2026-09-08).
#
# Обход: пробрасываем Postgres сервера на localhost и запускаем ту же команду
# локальным инструментарием, где она работает. Версия Medusa та же (lock-файл
# один), схема получается идентичной.
#
# Запуск: bash scripts/migrate-remote.sh
set -euo pipefail

HOST=${DEPLOY_HOST:-stroymarket}
REMOTE_DIR=${DEPLOY_DIR:-stroymarket}
LOCAL_PORT=${LOCAL_PORT:-15432}

repo_root=$(cd "$(dirname "$0")/.." && pwd)
cd "$repo_root"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

say "Читаю доступ к базе с сервера"
remote_env=$(ssh "$HOST" "cat ~/$REMOTE_DIR/infra/prod/.env")
pg_user=$(printf '%s' "$remote_env" | awk -F= '$1=="POSTGRES_USER"{print $2; exit}')
pg_pass=$(printf '%s' "$remote_env" | awk -F= '$1=="POSTGRES_PASSWORD"{print $2; exit}')
pg_db=$(printf '%s' "$remote_env" | awk -F= '$1=="POSTGRES_DB"{print $2; exit}')
pg_ip=$(ssh "$HOST" 'docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" stroymarket-postgres-1')
if [ -z "$pg_pass" ] || [ -z "$pg_ip" ]; then
  echo "Не удалось получить доступ к базе (пароль или адрес контейнера)" >&2
  exit 1
fi

say "Поднимаю туннель 127.0.0.1:$LOCAL_PORT → $pg_ip:5432"
ssh -f -N -L "$LOCAL_PORT:$pg_ip:5432" "$HOST"
tunnel_pid=$(ps -W 2>/dev/null | grep -c ssh || true)
cleanup() {
  # Туннель поднят с -f (уходит в фон сам), поэтому закрываем по совпадению
  # проброса, а не по PID — так надёжнее в Git Bash.
  pkill -f "ssh -f -N -L $LOCAL_PORT:$pg_ip:5432" 2>/dev/null || true
}
trap cleanup EXIT

say "Прогоняю миграции"
cd backend
DATABASE_URL="postgres://$pg_user:$pg_pass@127.0.0.1:$LOCAL_PORT/$pg_db" \
  npx medusa db:migrate --execute-safe-links --skip-scripts < /dev/null

say "Готово. Поднимаю бэкенд на сервере"
ssh "$HOST" "cd ~/$REMOTE_DIR/infra/prod && docker compose up -d backend"
