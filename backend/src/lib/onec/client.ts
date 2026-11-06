// HTTP-клиент выгрузки номенклатуры из 1С (HTTP-сервис публикации 1С:Fresh или
// своей базы): GET по адресу сервиса с Basic-авторизацией пользователя 1С.
//
// Ответы 1С разбираются в понятные продавцу причины: на экране «Интеграция 1С»
// нужно «у пользователя нет прав на сервис», а не «HTTP 403».

export type OnecCredentials = {
  base_url: string
  login: string
  password: string
}

export const ONEC_ERROR_CODES = [
  "unauthorized",
  "forbidden",
  "not_found",
  "method_not_allowed",
  "server_error",
  "http_error",
  "timeout",
  "network",
  "bad_response",
] as const
export type OnecErrorCode = (typeof ONEC_ERROR_CODES)[number]

export class OnecRequestError extends Error {
  constructor(
    public code: OnecErrorCode,
    message: string,
    public status?: number
  ) {
    super(message)
  }
}

// Выгрузка большой номенклатуры в 1С:Fresh собирается десятки секунд.
export const ONEC_TIMEOUT_MS = 180_000

// 1С отдаёт тексты (и JSON) с BOM в начале — JSON.parse на нём падает.
const stripBom = (text: string): string => text.replace(/^﻿/, "")

const authHeader = (login: string, password: string): string =>
  `Basic ${Buffer.from(`${login}:${password}`, "utf8").toString("base64")}`

const bodySnippet = (text: string): string => {
  const clean = stripBom(text).replace(/\s+/g, " ").trim()
  return clean.length > 200 ? `${clean.slice(0, 200)}…` : clean
}

const httpError = (status: number, text: string): OnecRequestError => {
  const detail = bodySnippet(text)
  const suffix = detail ? ` Ответ 1С: «${detail}»` : ""
  switch (status) {
    case 401:
      return new OnecRequestError(
        "unauthorized",
        `1С не приняла логин или пароль.${suffix}`,
        status
      )
    case 403:
      return new OnecRequestError(
        "forbidden",
        `У пользователя 1С нет прав на сервис выгрузки — нужна роль с доступом к HTTP-сервису.${suffix}`,
        status
      )
    case 404:
      return new OnecRequestError(
        "not_found",
        `Адрес сервиса в 1С не найден — проверьте ссылку.${suffix}`,
        status
      )
    case 405:
      return new OnecRequestError(
        "method_not_allowed",
        `Сервис 1С не принимает GET-запрос по этому адресу.${suffix}`,
        status
      )
    default:
      return status >= 500
        ? new OnecRequestError(
            "server_error",
            `1С ответила ошибкой сервера (${status}).${suffix}`,
            status
          )
        : new OnecRequestError(
            "http_error",
            `1С ответила кодом ${status}.${suffix}`,
            status
          )
  }
}

export type OnecFetchResult = {
  payload: unknown
  bytes: number
  duration_ms: number
}

export const fetchOnecItems = async (
  credentials: OnecCredentials,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}
): Promise<OnecFetchResult> => {
  const doFetch = options.fetchImpl ?? fetch
  const started = Date.now()

  let response: Response
  try {
    response = await doFetch(credentials.base_url, {
      method: "GET",
      headers: {
        Authorization: authHeader(credentials.login, credentials.password),
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? ONEC_TIMEOUT_MS),
    })
  } catch (error) {
    const name = (error as { name?: string })?.name
    if (name === "TimeoutError" || name === "AbortError") {
      throw new OnecRequestError(
        "timeout",
        "1С не ответила вовремя — база занята или недоступна."
      )
    }
    throw new OnecRequestError(
      "network",
      `Не удалось связаться с 1С: ${(error as Error)?.message ?? "сеть недоступна"}`
    )
  }

  const text = await response.text()
  if (!response.ok) {
    throw httpError(response.status, text)
  }

  const clean = stripBom(text).trim()
  if (!clean) {
    throw new OnecRequestError("bad_response", "1С вернула пустой ответ.")
  }
  let payload: unknown
  try {
    payload = JSON.parse(clean)
  } catch {
    throw new OnecRequestError(
      "bad_response",
      `Ответ 1С — не JSON: «${bodySnippet(clean)}»`
    )
  }

  return {
    payload,
    bytes: Buffer.byteLength(text, "utf8"),
    duration_ms: Date.now() - started,
  }
}
