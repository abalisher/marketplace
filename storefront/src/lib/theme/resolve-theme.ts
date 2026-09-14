import { getTheme } from "@lib/data/theme-actions"
import { DEFAULT_THEME, isTheme, Theme } from "./config"

// Тема из cookie `_sm_theme`; дефолт — системная. Вызывается в корневом layout:
// при явном light/dark класс темы ставится сразу в SSR, при `system` —
// скриптом первого кадра (modules/layout/components/theme-script).
export const resolveTheme = async (): Promise<Theme> => {
  const value = await getTheme()
  return isTheme(value) ? value : DEFAULT_THEME
}
