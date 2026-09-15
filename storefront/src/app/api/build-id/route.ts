// Метка текущей сборки витрины — для `DeployRefresh`: открытая вкладка сверяет
// с ней свою вшитую метку и перезагружается, если стенд пересобран.
//
// Значение вшито на сборке (`env` в next.config.js), поэтому процесс отдаёт
// метку ровно того бандла, который сам раздаёт. `no-store` обязателен: его
// Cloudflare пропускает как есть, а `no-cache` переписал бы в `max-age=14400`
// (infra/prod/README.md, «Кэш Cloudflare»), и вкладка четыре часа не видела бы
// новую выкладку.

export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(
    { buildId: process.env.STOREFRONT_BUILD_ID ?? null },
    { headers: { "cache-control": "no-store" } }
  )
}
