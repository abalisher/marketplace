# Прод-образ витрины покупателя (Next.js 15).
#
# Витрина ходит в бэкенд ТОЛЬКО с сервера: SDK (`src/lib/config.ts`), middleware
# и прокси-роуты ассистента (`/api/assistant/*`). Браузер общается лишь с самой
# витриной, поэтому MEDUSA_BACKEND_URL — внутреннее имя сервиса, а не публичный
# адрес, и CORS витрине не нужен.
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* вшиваются в бандл на СБОРКЕ — их нельзя передать при запуске,
# отсюда build-аргументы. Публикуемый ключ появляется только после сида
# каталога, поэтому образ витрины собирается ПОСЛЕ первого подъёма бэкенда
# (порядок — в infra/prod/deploy-server.sh).
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION=kz
ARG NEXT_PUBLIC_FEATURE_COMPANIES=false
# Кнопка тестовой оплаты Kaspi (только стенд, см. src/lib/feature-flags.ts).
ARG NEXT_PUBLIC_KASPI_MOCK=false
ARG NEXT_PUBLIC_MEDIA_BASE_URL
# Ключ карты 2ГИС для выбора адреса (публичный, виден в браузере). Пусто —
# карты нет, адрес вводится текстом.
ARG NEXT_PUBLIC_2GIS_KEY=
# Адрес бэкенда НА ВРЕМЯ СБОРКИ. `next build` собирает данные страниц категорий
# и товаров, то есть обращается к Store API прямо во время сборки; без этого
# значения он идёт в дефолтный localhost:9000 и падает с ECONNREFUSED. В
# рантайме адрес другой (имя сервиса в сети compose) — см. docker-compose.yml.
ARG MEDUSA_BACKEND_URL=http://127.0.0.1:9000
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NEXT_PUBLIC_FEATURE_COMPANIES=$NEXT_PUBLIC_FEATURE_COMPANIES \
    NEXT_PUBLIC_KASPI_MOCK=$NEXT_PUBLIC_KASPI_MOCK \
    NEXT_PUBLIC_MEDIA_BASE_URL=$NEXT_PUBLIC_MEDIA_BASE_URL \
    NEXT_PUBLIC_2GIS_KEY=$NEXT_PUBLIC_2GIS_KEY \
    NODE_ENV=production

RUN npm run build

# Запускаем `next start` из этого же слоя: standalone-вывод в next.config не
# включён, и включать его ради размера образа значило бы менять сборку витрины
# перед первым деплоем.
ENV PORT=8000
EXPOSE 8000
CMD ["npm", "run", "start"]
