import { sdk } from "./sdk"

// Роль пользователя панели. В OSS-ядре Medusa v2 прав у admin-пользователей нет
// (любой всесилен), поэтому роль — это признак ОБОЛОЧКИ: что показывать в
// сайдбаре и настройках. Значение лежит в `user.metadata.role`; учётку продавца
// создаёт `src/scripts/create-seller-user.ts`.
//
// Отсутствие значения = владелец: существующие учётки админа продолжают видеть
// панель целиком, роль надо проставить осознанно.
// `picker` — сборщик: его рабочее место мобильное (`apps/partner`), в панели
// ему полагается только заглушка со ссылкой на приложение (решение владельца
// 2026-09-06). До этого роль `picker` не совпадала с `seller` и падала в
// `owner`: сборщик открывал панель магазина целиком.
export type ShellRole = "owner" | "seller" | "picker"

export const SHELL_ROLE_KEY = "role"

// Кэш в localStorage нужен, чтобы режим применялся ПЕРВЫМ кадром: запрос
// `/admin/users/me` возвращается уже после отрисовки сайдбара, и без кэша
// продавец успевал увидеть владельческие пункты.
const CACHE_KEY = "sm_shell_role"

const isShellRole = (value: unknown): value is ShellRole =>
  value === "owner" || value === "seller" || value === "picker"

export const cachedShellRole = (): ShellRole | null => {
  try {
    const value = localStorage.getItem(CACHE_KEY)
    return isShellRole(value) ? value : null
  } catch {
    // localStorage может быть недоступен (приватный режим) — не повод падать.
    return null
  }
}

export const rememberShellRole = (role: ShellRole) => {
  try {
    localStorage.setItem(CACHE_KEY, role)
  } catch {
    // см. cachedShellRole
  }
}

type MeResponse = {
  user?: { metadata?: Record<string, unknown> | null } | null
}

// Роль залогиненного пользователя. На экране входа запрос отдаёт 401 — вызывающий
// код обязан обработать отказ (режим тогда не меняем).
export const fetchShellRole = async (): Promise<ShellRole> => {
  const response = await sdk.client.fetch<MeResponse>("/admin/users/me")
  const role = response?.user?.metadata?.[SHELL_ROLE_KEY]
  return isShellRole(role) && role !== "owner" ? role : "owner"
}
