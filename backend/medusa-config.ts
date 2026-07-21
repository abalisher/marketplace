import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
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
