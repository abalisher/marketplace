// Темы витрины: `system` — следовать системной настройке (как в mobile),
// `light`/`dark` — явный выбор пользователя. Значение хранится в cookie
// `_sm_theme` (см. lib/data/theme-actions), палитры — src/styles/tokens.css.
export const THEMES = ["system", "light", "dark"] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = "system"

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value)
