import { Theme } from "./config"

/**
 * Применяет тему к <html> на клиенте: класс `dark` (его читают токены в
 * src/styles/tokens.css и darkMode: "class" Tailwind), `data-mode` для
 * компонентов @medusajs/ui и `color-scheme` для нативных контролов.
 *
 * Класс ставится именно на <html>: переменные Medusa объявлены на :root и
 * вычисляются там же (см. комментарий в tokens.css).
 *
 * ВНИМАНИЕ: та же логика продублирована строкой в theme-script — скрипту
 * первого кадра нельзя импортировать модули. Меняешь здесь — меняй там.
 */
export const applyTheme = (theme: Theme): void => {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const root = document.documentElement
  root.classList.toggle("dark", isDark)
  root.dataset.mode = isDark ? "dark" : "light"
  root.style.colorScheme = isDark ? "dark" : "light"
}
