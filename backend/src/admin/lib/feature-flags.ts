import { sdk } from "./sdk"

// Фича-флаги панели: какие домены включены на бэкенде. Значения приходят с
// `GET /admin/feature-flags` — панель собрана заранее и env бэкенда не видит.
//
// Сейчас флаг один: `companies` — юрлица целиком (раздел «Компании», карточка
// скоринга и кредитного лимита, «Настройки → Правила скоринга»). На MVP он
// выключен (разворот владельца 2026-08-25); включение возвращает разделы БЕЗ
// пересборки панели.
//
// Кэш в localStorage — по идиоме shell-role.ts: ответ приходит уже после первой
// отрисовки сайдбара, и без кэша отключённый раздел успевал мелькнуть.
export type FeatureFlags = {
  companies: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = { companies: false }

const CACHE_KEY = "sm_feature_flags"

export const cachedFeatureFlags = (): FeatureFlags | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>
    return typeof parsed?.companies === "boolean"
      ? { companies: parsed.companies }
      : null
  } catch {
    // localStorage недоступен (приватный режим) или мусор в кэше — не повод падать.
    return null
  }
}

export const rememberFeatureFlags = (flags: FeatureFlags) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(flags))
  } catch {
    // см. cachedFeatureFlags
  }
}

type FeatureFlagsResponse = {
  feature_flags?: Partial<FeatureFlags> | null
}

// Флаги с бэкенда. На экране входа роут отдаёт 401 — вызывающий код обязан
// обработать отказ (тогда остаётся то, что уже применено из кэша).
export const fetchFeatureFlags = async (): Promise<FeatureFlags> => {
  const response =
    await sdk.client.fetch<FeatureFlagsResponse>("/admin/feature-flags")
  return {
    companies: response?.feature_flags?.companies === true,
  }
}
