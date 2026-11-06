import { fetchOnecItems, OnecRequestError } from "../client"
import { decryptSecret, encryptSecret, OnecSecretError } from "../secret"

const credentials = {
  base_url: "https://1c.example/hs/items/getitems",
  login: "user@example.kz",
  password: "пароль!1",
}

const respond = (status: number, body: string) =>
  jest.fn(async () => new Response(body, { status })) as unknown as typeof fetch

const errorOf = async (promise: Promise<unknown>) => {
  try {
    await promise
  } catch (error) {
    return error as OnecRequestError
  }
  throw new Error("ожидалась ошибка")
}

describe("fetchOnecItems", () => {
  it("GET с Basic-авторизацией, JSON с BOM разбирается", async () => {
    const fetchImpl = respond(200, '﻿[{"Код":"1"}]')
    const result = await fetchOnecItems(credentials, { fetchImpl })
    expect(result.payload).toEqual([{ Код: "1" }])

    const [url, init] = (fetchImpl as unknown as jest.Mock).mock.calls[0]
    expect(url).toBe(credentials.base_url)
    expect(init.method).toBe("GET")
    const token = init.headers.Authorization.replace("Basic ", "")
    expect(Buffer.from(token, "base64").toString("utf8")).toBe(
      "user@example.kz:пароль!1"
    )
  })

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [405, "method_not_allowed"],
    [500, "server_error"],
    [418, "http_error"],
  ])("HTTP %i → %s", async (status, code) => {
    const error = await errorOf(
      fetchOnecItems(credentials, {
        fetchImpl: respond(status, "﻿Недостаточно прав"),
      })
    )
    expect(error).toBeInstanceOf(OnecRequestError)
    expect(error.code).toBe(code)
    expect(error.status).toBe(status)
  })

  it("текст 1С попадает в сообщение без BOM", async () => {
    const error = await errorOf(
      fetchOnecItems(credentials, {
        fetchImpl: respond(403, "﻿Недостаточно прав для использования ресурса"),
      })
    )
    expect(error.message).toContain("«Недостаточно прав для использования ресурса»")
  })

  it("не JSON и пустой ответ — bad_response", async () => {
    expect(
      (await errorOf(fetchOnecItems(credentials, { fetchImpl: respond(200, "<html>") })))
        .code
    ).toBe("bad_response")
    expect(
      (await errorOf(fetchOnecItems(credentials, { fetchImpl: respond(200, "  ") }))).code
    ).toBe("bad_response")
  })

  it("сеть и таймаут", async () => {
    const network = jest.fn(async () => {
      throw new TypeError("fetch failed")
    }) as unknown as typeof fetch
    expect((await errorOf(fetchOnecItems(credentials, { fetchImpl: network }))).code).toBe(
      "network"
    )

    const timeout = jest.fn(async () => {
      const error = new Error("timeout")
      error.name = "TimeoutError"
      throw error
    }) as unknown as typeof fetch
    expect((await errorOf(fetchOnecItems(credentials, { fetchImpl: timeout }))).code).toBe(
      "timeout"
    )
  })
})

describe("secret", () => {
  const saved = { ...process.env }
  afterEach(() => {
    process.env = { ...saved }
  })

  it("шифрует и расшифровывает; шифротекст не содержит пароля и каждый раз новый", () => {
    process.env.ONEC_SECRET_KEY = "k1"
    const a = encryptSecret("!1IPsecret")
    const b = encryptSecret("!1IPsecret")
    expect(a).not.toContain("IPsecret")
    expect(a).not.toBe(b)
    expect(decryptSecret(a)).toBe("!1IPsecret")
  })

  it("без ONEC_SECRET_KEY ключ берётся от JWT_SECRET", () => {
    delete process.env.ONEC_SECRET_KEY
    process.env.JWT_SECRET = "jwt"
    expect(decryptSecret(encryptSecret("x"))).toBe("x")
  })

  it("сменился секрет — понятная ошибка, а не мусор", () => {
    process.env.ONEC_SECRET_KEY = "k1"
    const cipher = encryptSecret("x")
    process.env.ONEC_SECRET_KEY = "k2"
    expect(() => decryptSecret(cipher)).toThrow(OnecSecretError)
    expect(() => decryptSecret("plain")).toThrow(OnecSecretError)
  })
})
