#!/usr/bin/env bash
# Локальный CI-скелет: lint + тесты всех частей монорепо.
# Запуск: bash scripts/ci.sh (Windows — из Git Bash). Будущие GitHub Actions вызывают его же.
# Интеграционные тесты бэкенда (нужны postgres/redis) сюда не входят — запускаются отдельно.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== backend: lint ==="
(cd backend && npm run lint)

echo "=== backend: typecheck ==="
# jest (swc) и eslint типы не проверяют — без tsc сломанный `medusa build` живёт незамеченным.
(cd backend && npx tsc --noEmit && npx tsc --noEmit -p src/admin/tsconfig.json)

echo "=== backend: unit tests ==="
(cd backend && npm run test:unit)

echo "=== storefront: lint ==="
(cd storefront && npm run lint)

echo "=== mobile: format check ==="
(cd mobile && dart format --set-exit-if-changed .)

echo "=== mobile: analyze ==="
(cd mobile && flutter analyze)

echo "=== mobile: tests ==="
for pkg in mobile/apps/* mobile/packages/*; do
  if [ -d "$pkg/test" ]; then
    echo "--- $pkg ---"
    (cd "$pkg" && flutter test)
  fi
done

echo "=== CI OK ==="
