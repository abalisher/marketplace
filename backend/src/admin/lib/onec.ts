// Типы и подписи экрана «1С и Excel» (GET/POST /admin/onec, /check, /sync,
// /file, /template).

export type OnecSource = "http" | "file"

export type AdminOnecConnection = {
  id: string
  tenant_id: string
  source: OnecSource
  base_url: string | null
  stock_url: string | null
  login: string | null
  has_password: boolean
  enabled: boolean
  interval_minutes: number
  exclusive_catalog: boolean
  stock_location_id: string | null
  updated_at: string | null
}

export type OnecRunStatus = "running" | "success" | "partial" | "empty" | "failed"

export type AdminOnecRun = {
  id: string
  trigger: "schedule" | "manual" | "file"
  status: OnecRunStatus
  started_at: string
  finished_at: string | null
  received: number
  created: number
  updated: number
  unchanged: number
  hidden: number
  detached: number
  failed: number
  error: string | null
  issues: { key: string | null; name: string | null; message: string }[]
  file_name: string | null
}

export type AdminOnecTenantResponse = {
  tenant: { id: string; name: string; slug: string }
  connection: AdminOnecConnection | null
  locations: { id: string; name: string }[]
  products: { total: number; present: number }
  runs: AdminOnecRun[]
}

export type AdminOnecTenantsResponse = {
  tenants: {
    id: string
    name: string
    slug: string
    status: string
    connection: AdminOnecConnection | null
    last_run: AdminOnecRun | null
  }[]
}

export type AdminOnecTestItem = {
  key: string
  code: string | null
  article: string | null
  name: string
  unit: string | null
  price: number | null
  stock: number | null
  cost: number | null
  group: string | null
}

export type AdminOnecTestResult = {
  ok: true
  duration_ms: number
  bytes: number
  total: number
  received: number
  fields: Record<string, string>
  sample: AdminOnecTestItem[]
  stock: {
    total: number
    received: number
    matched: number
    fields: Record<string, string>
    applied: boolean
    note: string | null
  } | null
  issues: { key: string | null; name: string | null; message: string }[]
  // Excel: лист и строка заголовков, по которым прочитан файл.
  sheet: string | null
  header_row: number | null
  // Excel: колонки, дописанные к наименованию («Характеристика», «Бренд»).
  name_parts?: string[]
}

// Файл до 10 МБ: больше бэкенд не примет (validators.ts, file-feed.ts).
export const ONEC_FILE_MAX_BYTES = 10 * 1024 * 1024
export const ONEC_FILE_ACCEPT = ".xlsx,.xls,.csv"

export const ONEC_INTERVALS = [15, 30, 60, 180, 720, 1440] as const

export const ONEC_RUN_STATUS_COLOR: Record<
  OnecRunStatus,
  "green" | "orange" | "red" | "blue" | "grey"
> = {
  running: "blue",
  success: "green",
  partial: "orange",
  empty: "orange",
  failed: "red",
}

// Поля позиции 1С в порядке показа на экране проверки.
export const ONEC_FIELDS = [
  "key",
  "code",
  "article",
  "name",
  "brand",
  "unit",
  "price",
  "cost",
  "stock",
  "group",
  "barcode",
  "description",
] as const
