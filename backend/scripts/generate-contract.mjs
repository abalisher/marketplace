// Генерация contracts/openapi.json — контракта API для Dart-кодогена (mobile).
//
// База — официальная спека Medusa v2 Store API (docs.medusajs.com) + точечная
// выборка ядровых admin-операций из Admin-спеки (ADMIN_BASE_PATHS — то, что
// нужно partner-клиенту: логин продавца, заказы, товары, склады; вся Admin-спека
// не нужна и огромна). Поверх мерджатся фрагменты кастомных роутов:
// backend/src/api/**/*.oas.json (каждый фрагмент — объект с необязательными
// ключами `paths` и `components`, они подмешиваются в итоговую спеку; конфликт
// путей — ошибка).
//
// Запуск: npm run contract:generate (из backend/). Нужен интернет (скачивание базы).

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { load as parseYaml } from "js-yaml"

const BASE_SPEC_URL = "https://docs.medusajs.com/api/download/store"
const ADMIN_SPEC_URL = "https://docs.medusajs.com/api/download/admin"

// Ядровые admin-операции для partner-приложения (гэп 8 сверки partner-раунда,
// 2026-07-18). Расширять по мере надобности клиента — замыкание схем ($ref)
// подтянется автоматически.
const ADMIN_BASE_PATHS = {
  "/auth/user/{auth_provider}": ["post"],
  "/auth/token/refresh": ["post"],
  "/admin/orders": ["get"],
  "/admin/orders/{id}": ["get"],
  "/admin/products": ["get"],
  "/admin/products/{id}": ["get"],
  "/admin/stock-locations": ["get"],
}

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const apiDir = join(backendDir, "src", "api")
const outFile = resolve(backendDir, "..", "contracts", "openapi.json")

function collectFragmentFiles(dir) {
  let files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(collectFragmentFiles(full))
    } else if (entry.name.endsWith(".oas.json")) {
      files.push(full)
    }
  }
  return files
}

// Операторные фильтры Medusa ($and/$or/$eq/$in/$not...) в query-параметрах ломают
// Dart-кодоген: из них генерятся классы с полями-ключевыми словами Dart (in, not).
// Схлопываем такие схемы в свободный object — клиент передаёт фильтр как Map.
function normalizeOperatorFilters(node) {
  if (Array.isArray(node)) {
    node.forEach(normalizeOperatorFilters)
    return
  }
  if (node === null || typeof node !== "object") {
    return
  }
  if (node.properties && Object.keys(node.properties).some((k) => k.startsWith("$"))) {
    delete node.properties
    delete node.oneOf
    node.type = "object"
    node.additionalProperties = true
    return
  }
  Object.values(node).forEach(normalizeOperatorFilters)
}

// swagger_parser генерирует необязательные свойства-композиции (allOf/oneOf/anyOf)
// как non-nullable поля без required — это не компилируется (freezed/json_serializable).
// Явный nullable: true чинит кодоген; на смысл контракта не влияет (свойство и так optional).
function markOptionalCompositionsNullable(node) {
  if (Array.isArray(node)) {
    node.forEach(markOptionalCompositionsNullable)
    return
  }
  if (node === null || typeof node !== "object") {
    return
  }
  if (node.properties) {
    const required = new Set(node.required ?? [])
    for (const [name, prop] of Object.entries(node.properties)) {
      if (!required.has(name) && (prop.allOf || prop.oneOf || prop.anyOf)) {
        prop.nullable = true
      }
    }
  }
  Object.values(node).forEach(markOptionalCompositionsNullable)
}

// В спеке Medusa встречаются default, не совпадающие по типу со схемой
// (например, boolean deleted с default "variant") — кодоген вставляет их в Dart как есть.
function dropMismatchedDefaults(node) {
  if (Array.isArray(node)) {
    node.forEach(dropMismatchedDefaults)
    return
  }
  if (node === null || typeof node !== "object") {
    return
  }
  if (typeof node.type === "string" && "default" in node) {
    const expected = { boolean: "boolean", number: "number", integer: "number", string: "string" }[node.type]
    if (expected && typeof node.default !== expected) {
      delete node.default
    }
  }
  Object.values(node).forEach(dropMismatchedDefaults)
}

// Структурные object-параметры query (фильтры вида variants[...], created_at[$gt]...)
// схлопываем в свободный object → в Dart это Map, а не отдельный битый класс.
// Тела запросов помечаем required: у Medusa у них все поля опциональны, но кодоген
// не умеет опциональный @Body(); клиент при желании передаёт пустой объект.
function normalizeOperations(paths) {
  for (const pathItem of Object.values(paths)) {
    for (const op of Object.values(pathItem)) {
      if (op === null || typeof op !== "object") {
        continue
      }
      for (const param of op.parameters ?? []) {
        const schema = param?.schema
        if (param?.in === "query" && schema && (schema.type === "object" || schema.allOf || schema.oneOf || schema.anyOf)) {
          param.schema = {
            type: "object",
            description: schema.description ?? param.description,
            additionalProperties: true,
          }
        }
      }
      if (op.requestBody) {
        op.requestBody.required = true
      }
    }
  }
}

// Собирает имена схем, на которые (транзитивно) ссылается узел через
// $ref "#/components/schemas/<имя>".
function collectSchemaRefs(node, into) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectSchemaRefs(item, into))
    return
  }
  if (node === null || typeof node !== "object") {
    return
  }
  if (typeof node.$ref === "string") {
    const match = node.$ref.match(/^#\/components\/schemas\/(.+)$/)
    if (match) {
      into.add(match[1])
    }
  }
  Object.values(node).forEach((value) => collectSchemaRefs(value, into))
}

// Точечный мердж операций Admin-спеки: whitelisted-пути + транзитивное
// замыкание их схем. Одноимённая схема уже в целевой спеке: идентичная —
// пропуск (общие базовые типы двух спек), различная — ошибка (молчаливая
// подмена сломала бы контракт).
function mergeAdminBase(spec, adminSpec) {
  const pendingSchemas = new Set()

  for (const [path, methods] of Object.entries(ADMIN_BASE_PATHS)) {
    const source = adminSpec.paths?.[path]
    if (!source) {
      throw new Error(`ADMIN_BASE_PATHS: путь ${path} не найден в Admin-спеке`)
    }
    for (const method of methods) {
      const op = source[method]
      if (!op) {
        throw new Error(`ADMIN_BASE_PATHS: операция ${method} ${path} не найдена в Admin-спеке`)
      }
      const existing = spec.paths[path]
      if (existing?.[method]) {
        // Уже есть в Store-базе (например /auth/token/refresh) — база главнее.
        continue
      }
      // Admin- и Store-спеки используют ОДИНАКОВЫЕ operationId и теги для
      // зеркальных операций (GetProductsId и в /store, и в /admin) — Dart-кодоген
      // группирует клиентов по тегу и падает на дубле имён методов. Admin-ветке —
      // префикс Admin в id и свой тег (отдельные Admin*-клиенты в Dart).
      if (op.operationId && !op.operationId.includes("Admin")) {
        op.operationId = `Admin${op.operationId}`
      }
      op.tags = (op.tags?.length ? op.tags : ["Admin"]).map((tag) =>
        tag.toLowerCase().includes("admin") ? tag : `Admin ${tag}`
      )
      spec.paths[path] ??= {}
      spec.paths[path][method] = op
      collectSchemaRefs(op, pendingSchemas)
    }
  }

  const added = []
  const queue = [...pendingSchemas]
  while (queue.length) {
    const name = queue.pop()
    const schema = adminSpec.components?.schemas?.[name]
    if (!schema) {
      throw new Error(`ADMIN_BASE_PATHS: схема ${name} не найдена в Admin-спеке`)
    }
    const existing = spec.components.schemas[name]
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(schema)) {
        throw new Error(`ADMIN_BASE_PATHS: схема ${name} различается в Store- и Admin-спеках`)
      }
      continue
    }
    spec.components.schemas[name] = schema
    added.push(name)
    const refs = new Set()
    collectSchemaRefs(schema, refs)
    for (const ref of refs) {
      if (!spec.components.schemas[ref]) {
        queue.push(ref)
      }
    }
  }
  return added.length
}

const res = await fetch(BASE_SPEC_URL)
if (!res.ok) {
  throw new Error(`Не удалось скачать базовую спеку: HTTP ${res.status} ${BASE_SPEC_URL}`)
}
const spec = parseYaml(await res.text())

const adminRes = await fetch(ADMIN_SPEC_URL)
if (!adminRes.ok) {
  throw new Error(`Не удалось скачать Admin-спеку: HTTP ${adminRes.status} ${ADMIN_SPEC_URL}`)
}
const adminSpec = parseYaml(await adminRes.text())
const adminSchemasAdded = mergeAdminBase(spec, adminSpec)

spec.servers = [{ url: "http://localhost:9000", description: "Local dev" }]
normalizeOperatorFilters(spec)
markOptionalCompositionsNullable(spec)
dropMismatchedDefaults(spec)
normalizeOperations(spec.paths)

const fragments = collectFragmentFiles(apiDir)
for (const file of fragments) {
  const fragment = JSON.parse(readFileSync(file, "utf8"))
  for (const [path, item] of Object.entries(fragment.paths ?? {})) {
    const existing = spec.paths[path]
    if (!existing) {
      spec.paths[path] = item
      continue
    }
    // Путь уже есть в базовой спеке (например ядровый GET /store/orders) —
    // дописываем НОВЫЕ методы, не затирая существующие. Коллизия того же
    // метода — ошибка (иначе кастом молча перекрыл бы ядровую операцию).
    for (const [method, op] of Object.entries(item)) {
      if (existing[method]) {
        throw new Error(
          `Конфликт операции ${method.toUpperCase()} ${path} во фрагменте ${file}`
        )
      }
      existing[method] = op
    }
  }
  // x-extendPaths — точечное расширение УЖЕ существующих в базовой спеке
  // операций (например, кастомный query-параметр ядрового роута). Пока
  // поддерживаются только parameters; новые пути объявляются через paths.
  for (const [path, ops] of Object.entries(fragment["x-extendPaths"] ?? {})) {
    const target = spec.paths[path]
    if (!target) {
      throw new Error(`x-extendPaths: путь ${path} не найден в базовой спеке (${file})`)
    }
    for (const [method, extension] of Object.entries(ops)) {
      const op = target[method]
      if (!op) {
        throw new Error(`x-extendPaths: операция ${method} ${path} не найдена (${file})`)
      }
      op.parameters = [...(op.parameters ?? []), ...(extension.parameters ?? [])]
    }
  }
  for (const [section, entries] of Object.entries(fragment.components ?? {})) {
    spec.components[section] ??= {}
    for (const [name, schema] of Object.entries(entries)) {
      if (spec.components[section][name]) {
        throw new Error(`Конфликт components.${section}.${name} во фрагменте ${file}`)
      }
      spec.components[section][name] = schema
    }
  }
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(spec, null, 2) + "\n")

console.log(
  `contracts/openapi.json: ${Object.keys(spec.paths).length} путей, ` +
    `${Object.keys(spec.components?.schemas ?? {}).length} схем ` +
    `(из них ${adminSchemasAdded} из Admin-спеки), ` +
    `${fragments.length} кастомных фрагментов`
)
