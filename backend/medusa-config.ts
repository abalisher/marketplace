import { loadEnv, defineConfig } from '@medusajs/framework/utils'
// Store/Auth CORS хранятся в .env (там витрина :8000); dev-origin мобильного
// buyer-приложения (Flutter web на :3000) дописывается из общего списка
// `src/lib/cors-origins.ts` — его же читает middleware статики (фото товаров).
import { MOBILE_DEV_ORIGINS } from './src/lib/cors-origins'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const withMobileOrigins = (cors?: string) =>
  [cors, ...MOBILE_DEV_ORIGINS].filter(Boolean).join(",")

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: withMobileOrigins(process.env.STORE_CORS),
      // Приложение сборщика в web-сборке (:3100) ходит в admin-роуты заданий,
      // поэтому dev-origin'ы дописываются и сюда — иначе браузер режет запросы
      // CORS'ом, и очередь заданий у сборщика пустая без единой ошибки.
      adminCors: withMobileOrigins(process.env.ADMIN_CORS!),
      authCors: withMobileOrigins(process.env.AUTH_CORS),
      jwtSecret: process.env.JWT_SECRET,
      // Срок жизни токена входа. Дефолт Medusa — 1 день, и это ломало вход по
      // номеру: cookie витрины живёт 7 дней, поэтому через сутки интерфейс
      // выглядел авторизованным, а бэкенд видел гостя — ассистент просил
      // войти на каждом ходе (дефект приёмки 2026-09-07). Держим срок токена
      // и cookie согласованными.
      jwtExpiresIn: "7d",
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/company",
    },
    {
      resolve: "./src/modules/catalog",
    },
    {
      resolve: "./src/modules/order-lifecycle",
    },
    {
      resolve: "./src/modules/bonus",
    },
    {
      resolve: "./src/modules/documents",
    },
    {
      resolve: "./src/modules/reviews",
    },
    {
      resolve: "./src/modules/scoring",
    },
    {
      resolve: "./src/modules/estimator",
    },
    {
      resolve: "./src/modules/logistics",
    },
    {
      resolve: "./src/modules/procurement",
    },
    {
      resolve: "./src/modules/assembly",
    },
    {
      resolve: "./src/modules/driver",
    },
    // Ядровый файловый модуль объявлен явно ТОЛЬКО ради базового адреса
    // ссылок. По умолчанию локальный провайдер собирает их от
    // `http://localhost:9000/static`, и этот адрес уезжает в БД полем
    // `document.file_url`, а оттуда — покупателю в чат и кабинет как есть
    // (`lib/assistant/tools/get-order-documents.ts`, `api/store/documents`).
    // На развёрнутом стенде это давало нерабочую ссылку на счёт: локальный
    // адрес разработчика вместо адреса стенда (дефект найден 2026-09-08).
    // Базу берём из того же STATIC_BASE_URL, что и фотографии товаров;
    // каталог загрузок остаётся дефолтным (`static`).
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              backend_url: `${
                process.env.STATIC_BASE_URL ?? "http://localhost:9000"
              }/static`,
            },
          },
        ],
      },
    },
    // Ядровый auth-модуль объявлен явно, чтобы рядом с emailpass (учётки
    // админа/продавца и заведённые раньше покупатели) встал наш провайдер
    // «телефон + код» — вход покупателя по номеру (T10.7).
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "./src/modules/auth-phone",
            id: "phone",
          },
        ],
      },
    },
    // Ядровый платёжный модуль с нашим провайдером Kaspi за шлюзом. Системный
    // провайдер (pp_system_default) ядро регистрирует само — здесь только Kaspi.
    // Транспорт выбирается по env KASPI_MODE (mock|live), см. create-kaspi-client.ts.
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-kaspi",
            id: "kaspi",
            options: {
              mode: process.env.KASPI_MODE,
              merchant_id: process.env.KASPI_MERCHANT_ID,
              api_key: process.env.KASPI_API_KEY,
            },
          },
        ],
      },
    },
  ],
})
