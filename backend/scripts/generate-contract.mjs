// Генерация contracts/openapi.json — контракта API для Dart-кодогена (mobile).
//
// База — официальная спека Medusa v2 Store API (docs.medusajs.com), поверх неё
// мерджатся фрагменты кастомных роутов: backend/src/api/**/*.oas.json
// (каждый фрагмент — объект с необязательными ключами `paths` и `components`,
// они подмешиваются в итоговую спеку; конфликт путей — ошибка).
//
// Запуск: npm run contract:generate (из backend/). Нужен интернет (скачивание базы).

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { load as parseYaml } from "js-yaml"

const BASE_SPEC_URL = "https://docs.medusajs.com/api/download/store"

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

const res = await fetch(BASE_SPEC_URL)
if (!res.ok) {
  throw new Error(`Не удалось скачать базовую спеку: HTTP ${res.status} ${BASE_SPEC_URL}`)
}
const spec = parseYaml(await res.text())

spec.servers = [{ url: "http://localhost:9000", description: "Local dev" }]
normalizeOperatorFilters(spec)
markOptionalCompositionsNullable(spec)
dropMismatchedDefaults(spec)
normalizeOperations(spec.paths)

const fragments = collectFragmentFiles(apiDir)
for (const file of fragments) {
  const fragment = JSON.parse(readFileSync(file, "utf8"))
  for (const [path, item] of Object.entries(fragment.paths ?? {})) {
    if (spec.paths[path]) {
      throw new Error(`Конфликт пути ${path} во фрагменте ${file}`)
    }
    spec.paths[path] = item
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
    `${Object.keys(spec.components?.schemas ?? {}).length} схем, ` +
    `${fragments.length} кастомных фрагментов`
)
