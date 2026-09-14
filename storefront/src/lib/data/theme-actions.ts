"use server"

import { cookies as nextCookies } from "next/headers"

const THEME_COOKIE_NAME = "_sm_theme"

/**
 * Текущая тема из cookie (`system` | `light` | `dark`); null — не выбрана.
 */
export const getTheme = async (): Promise<string | null> => {
  try {
    const cookies = await nextCookies()
    return cookies.get(THEME_COOKIE_NAME)?.value ?? null
  } catch {
    return null
  }
}

/**
 * Сохраняет выбор темы. httpOnly: false — скрипт первого кадра и переключатель
 * читают/ставят тему на клиенте.
 */
export const updateTheme = async (theme: string): Promise<string> => {
  const cookies = await nextCookies()
  cookies.set(THEME_COOKIE_NAME, theme, {
    maxAge: 60 * 60 * 24 * 365, // год
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })

  return theme
}
