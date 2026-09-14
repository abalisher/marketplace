# Прод-образ бэкенда Medusa v2.
#
# Образ ОДНОСТУПЕНЧАТЫЙ намеренно: рядом с прод-сборкой (`.medusa/server`, своими
# зависимостями без dev) остаётся исходник и полный node_modules корня. Так на
# сервере работают ровно те команды, что описаны в CLAUDE.md — миграции и
# доменные скрипты стенда идут по TypeScript-исходнику
# (`npx medusa exec ./src/scripts/seed-kz.ts`), а не по угаданным путям
# скомпилированного вывода. Цена — размер образа; выгода — деплой и стенд
# управляются известными командами.
FROM node:22-bookworm-slim

# Медуза собирает нативные модули (pdfkit/fontkit) — нужен toolchain.
# ca-certificates: исходящий HTTPS к Gemini. tini: корректный PID 1.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Слой зависимостей отдельно от исходника — пересборка после правки кода
# не тянет npm ci заново.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Прод-сборка: компиляция бэкенда + бандл админки (панель продавца) в
# .medusa/server/public/admin. NODE_ENV на этом шаге НЕ production — сборке
# нужны devDependencies (typescript, vite).
RUN npm run build

# Шрифты бланков документов. `medusa build` копирует только код: ассеты модуля
# documents в .medusa/server не попадают, и выпуск счёта падал бы с
# «Cyrillic font (PTSans-Regular.ttf) not found» (см. комментарий в
# src/workflows/utils/render-document-pdf.ts). Прод-сборка сохраняет структуру
# под `src/`, поэтому путь ровно один — тот, что резолвер ищет относительно
# __dirname скомпилированного render-document-pdf.js (проверено на сервере).
RUN set -eux; \
    mkdir -p .medusa/server/src/modules/documents/assets/fonts; \
    cp src/modules/documents/assets/fonts/*.ttf \
      .medusa/server/src/modules/documents/assets/fonts/

# Зависимости прод-сборки. Medusa генерирует для .medusa/server свой
# package.json без lock-файла — здесь именно npm install, не npm ci.
RUN cd .medusa/server && npm install --omit=dev

# Каталог загрузок (фото товаров, PDF документов). Путь задан локальным
# file-провайдером и роутом /media/:file как `<cwd>/static`, а cwd сервера —
# каталог прод-сборки. В compose на него смонтирован том.
RUN mkdir -p /app/.medusa/server/static

ENV NODE_ENV=production
EXPOSE 9000

# Сервер поднимается ИЗ прод-сборки (medusa start ожидает её каталог как cwd),
# а обслуживающие команды запускаются из /app по исходнику.
WORKDIR /app/.medusa/server
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start"]
