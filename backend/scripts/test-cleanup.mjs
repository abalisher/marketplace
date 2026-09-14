// Удаляет остаточные временные БД интеграционных тестов.
// @medusajs/test-utils создаёт базы вида `medusa-<модуль|ulid>-integration-<n>` и дропает их
// в afterAll, но при `jest --forceExit` (и тем более при обрыве прогона по памяти) afterAll
// не успевает отработать — базы копятся. Скрипт вызывается как pre-хук перед прогоном.
import { loadEnv } from "@medusajs/utils"
import pg from "pg"

loadEnv("test", process.cwd())

// По умолчанию сносим только одноразовые базы http-прогона: их имя содержит ULID, поэтому
// каждый оборванный прогон оставляет новую. Базы модульных тестов названы по модулю
// (`medusa-catalog-integration-1`) — они переиспользуются и не размножаются, их дроп только
// заставил бы гонять миграции заново. Флаг `--all` сносит и их.
const ULID_ONLY = "^medusa-[0-9a-z]{26}-integration-"
const ANY_TEST_DB = "^medusa-.+-integration-"
const dropAll = process.argv.includes("--all")
const PATTERN = dropAll ? ANY_TEST_DB : ULID_ONLY

// Имя рабочей БД из DATABASE_URL — исключаем явно, даже если оно совпало с маской.
function protectedDbName() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return null
  }
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\//, "")) || null
  } catch {
    return null
  }
}

const client = new pg.Client({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME ?? "medusa",
  password: process.env.DB_PASSWORD ?? "medusa",
  database: "postgres",
})

try {
  await client.connect()
} catch (error) {
  // Нет postgres — не повод валить прогон: тесты сами упадут с внятной ошибкой.
  console.warn(`[test-cleanup] postgres недоступен, пропускаю: ${error.message}`)
  process.exit(0)
}

const keep = protectedDbName()
const { rows } = await client.query(
  `select datname, pg_database_size(datname) as size
     from pg_database
    where datname ~ $1 and datname <> coalesce($2, '')
    order by datname`,
  [PATTERN, keep]
)

if (rows.length === 0) {
  console.log("[test-cleanup] остаточных тестовых БД нет")
} else {
  const freed = rows.reduce((sum, row) => sum + Number(row.size), 0)
  for (const row of rows) {
    // WITH (FORCE) отцепляет зависшие сессии прошлого прогона (PostgreSQL 13+).
    await client.query(`drop database if exists "${row.datname}" with (force)`)
  }
  console.log(
    `[test-cleanup] удалено БД: ${rows.length}, освобождено ${Math.round(freed / 1024 / 1024)} MB`
  )
}

await client.end()
