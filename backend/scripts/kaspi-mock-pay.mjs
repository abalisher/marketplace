#!/usr/bin/env node
// Dev-утилита T8.6: «покупатель оплатил в Kaspi». Находит в базе стенда самую
// свежую НЕОПЛАЧЕННУЮ мок-сессию Kaspi и подтверждает её через dev-роут
// POST /store/carts/:id/payment/kaspi/mock-pay — после этого поллинг в чате
// сам покажет «оплачено», и заказ можно оформить. Нужна для ручных прогонов и
// приёмки (публичной песочницы Kaspi нет, мок задаёт исход только при создании
// инвойса).
//
// Запуск (бэкенд должен быть поднят, KASPI_MODE=mock):
//   npm run kaspi:pay                       — последняя неоплаченная сессия
//   npm run kaspi:pay -- cart_01ABC…        — конкретная корзина
// Корзина зарегистрированного покупателя доступна ТОЛЬКО ему, а оформление на
// MVP без входа и не начинается — поэтому токен покупателя скрипт добывает сам
// через dev-канал кода входа (тот же путь, что кнопка «Войти по номеру»): по
// номеру из учётки, к которой привязана корзина. На показе это важно: JWT лежит
// в httpOnly-cookie браузера, руками его оттуда не достать. Готовый токен можно
// передать и явно — CUSTOMER_TOKEN=<jwt> npm run kaspi:pay.
import { Client } from "pg"
import { config } from "dotenv"

config()

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9000"
const KASPI_PROVIDER_ID = "pp_kaspi_kaspi"

const explicitCartId = process.argv[2]

const db = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://medusa:medusa@localhost:5432/marketplace",
})

async function findCart() {
  if (explicitCartId) {
    const { rows } = await db.query(
      `select customer_id from cart where id = $1`,
      [explicitCartId]
    )
    return {
      cartId: explicitCartId,
      state: null,
      invoiceId: null,
      customerId: rows[0]?.customer_id ?? null,
    }
  }
  // Самая свежая сессия Kaspi, которая ещё не авторизована.
  const { rows } = await db.query(
    `select cpc.cart_id,
            ps.id             as session_id,
            ps.status         as session_status,
            ps.data->>'kaspi_state'      as kaspi_state,
            ps.data->>'kaspi_invoice_id' as invoice_id,
            c.customer_id     as customer_id
       from payment_session ps
       join payment_collection pc on pc.id = ps.payment_collection_id
       join cart_payment_collection cpc on cpc.payment_collection_id = pc.id
       join cart c on c.id = cpc.cart_id
      where ps.provider_id = $1
        and ps.status <> 'authorized'
        and ps.deleted_at is null
        and cpc.deleted_at is null
      order by ps.created_at desc
      limit 1`,
    [KASPI_PROVIDER_ID]
  )
  if (!rows.length) {
    throw new Error(
      "Неоплаченных Kaspi-сессий нет. Сначала доведи диалог до счёта (в чате появится QR)."
    )
  }
  return {
    cartId: rows[0].cart_id,
    state: rows[0].kaspi_state,
    invoiceId: rows[0].invoice_id,
    customerId: rows[0].customer_id ?? null,
  }
}

// Токен покупателя, которому принадлежит корзина: код входа берём из dev-канала
// (`dev_code` в ответе OTP-роута), как это делает витрина по кнопке входа. Новый
// токен НЕ рвёт сессию в браузере — JWT stateless, старый живёт до своего срока.
async function mintCustomerToken(customerId, apiKey) {
  const { rows } = await db.query(
    `select phone from customer where id = $1`,
    [customerId]
  )
  const phone = rows[0]?.phone
  if (!phone) {
    throw new Error(
      `У покупателя ${customerId} нет телефона в учётке — передай токен явно: ` +
        "CUSTOMER_TOKEN=<jwt> npm run kaspi:pay."
    )
  }

  const headers = {
    "content-type": "application/json",
    "x-publishable-api-key": apiKey,
  }
  const otpResponse = await fetch(`${BACKEND_URL}/store/auth/phone/otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone }),
  })
  const otp = await otpResponse.json().catch(() => ({}))
  if (otpResponse.status === 429) {
    throw new Error(
      `Код на ${phone} уже запрашивали — пауза «выслать снова» ещё ` +
        `${otp.retry_after ?? "?"} с. Повтори через минуту или передай токен: ` +
        "CUSTOMER_TOKEN=<jwt> npm run kaspi:pay."
    )
  }
  if (!otpResponse.ok || !otp.dev_code) {
    throw new Error(
      "Dev-канал кода входа недоступен (нет `dev_code` в ответе) — оплату " +
        "подтверди с токеном покупателя: CUSTOMER_TOKEN=<jwt> npm run kaspi:pay."
    )
  }

  const verifyResponse = await fetch(
    `${BACKEND_URL}/store/auth/phone/verify`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ phone, code: otp.dev_code }),
    }
  )
  const verify = await verifyResponse.json().catch(() => ({}))
  if (!verifyResponse.ok || !verify.token) {
    throw new Error(
      `Вход по номеру ${phone} не удался (HTTP ${verifyResponse.status}).`
    )
  }
  console.log(`Вошёл как покупатель ${phone} (dev-канал кода входа)`)
  return verify.token
}

async function publishableKey() {
  const { rows } = await db.query(
    `select token from api_key
      where type = 'publishable' and revoked_at is null
      order by created_at asc limit 1`
  )
  if (!rows.length) {
    throw new Error(
      "В базе нет publishable-ключа (Settings → Publishable API Keys)."
    )
  }
  return rows[0].token
}

async function main() {
  await db.connect()
  const [{ cartId, state, invoiceId, customerId }, apiKey] = await Promise.all([
    findCart(),
    publishableKey(),
  ])

  console.log(`Корзина: ${cartId}`)
  if (invoiceId) {
    console.log(`Инвойс:  ${invoiceId} (сейчас ${state ?? "?"})`)
  }

  // Личную корзину роут отдаёт только её владельцу: токен либо передали, либо
  // добываем сами по номеру из учётки. Гостевая корзина обходится без токена.
  const token =
    process.env.CUSTOMER_TOKEN ||
    (customerId ? await mintCustomerToken(customerId, apiKey) : undefined)

  const headers = {
    "content-type": "application/json",
    "x-publishable-api-key": apiKey,
  }
  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `${BACKEND_URL}/store/carts/${cartId}/payment/kaspi/mock-pay`,
    { method: "POST", headers }
  )
  const body = await response.text()

  if (!response.ok) {
    console.error(`HTTP ${response.status}: ${body}`)
    if (response.status === 404) {
      console.error(
        "404 — либо KASPI_MODE не mock, либо корзина принадлежит " +
          "зарегистрированному покупателю: повтори с CUSTOMER_TOKEN=<jwt>."
      )
    }
    process.exitCode = 1
    return
  }

  const payment = JSON.parse(body).payment
  console.log(
    `Оплачено: статус сессии ${payment.status}, Kaspi ${payment.kaspi_state}`
  )
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => db.end())
