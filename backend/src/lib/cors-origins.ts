// Единый источник разрешённых origin'ов витрины и мобилки: читают и
// `medusa-config.ts` (storeCors/authCors ядра), и middleware статики
// (`src/api/static-cors.ts`). Раньше список dev-origin'ов мобилки жил только в
// конфиге, и файлы из `/static` отдавались без CORS-заголовков — в web-сборке
// buyer фото товаров не грузились (найдено на приёмке 2026-08-11).

// Dev-origin'ы мобильных приложений в web-сборке: buyer на :3000, сборщик
// (`apps/partner`) на :3100. Сборщик ходит в ADMIN-роуты (`/admin/assembly-tasks`),
// поэтому его origin дописывается ещё и к `adminCors` — см. medusa-config.ts.
export const MOBILE_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3100",
  "http://127.0.0.1:3100",
]

// Origin'ы витрины из env (`STORE_CORS`) + мобилка. Секреты и адреса прода — в
// env, здесь только дописывание dev-origin'ов.
export const storeOrigins = (): string[] => {
  const fromEnv = (process.env.STORE_CORS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
  return [...new Set([...fromEnv, ...MOBILE_DEV_ORIGINS])]
}

export const storeCorsValue = (): string => storeOrigins().join(",")
