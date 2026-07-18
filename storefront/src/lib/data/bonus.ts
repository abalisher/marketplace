"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag, getCartId } from "./cookies"

// Бонусная программа: тонкие обёртки над кастомными роутами бэкенда.
// Балансы/потолки/валюту считает бэкенд — здесь только вызовы и ревалидация.

export type BonusBalance = {
  balance: number
  currency_code: string
}

// Баланс бонусного счёта текущего покупателя. Гость или ошибка — null
// (бонусы в чекауте просто не показываются).
export async function retrieveBonusBalance(): Promise<BonusBalance | null> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!("authorization" in headers)) {
    return null
  }

  return sdk.client
    .fetch<{ bonus: BonusBalance }>(`/store/bonus`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ bonus }) => ({
      balance: bonus.balance,
      currency_code: bonus.currency_code,
    }))
    .catch(() => null)
}

// Применить бонусы к корзине (повторный вызов заменяет сумму). Возвращает
// null при успехе или текст ошибки для формы (превышение потолка/баланса —
// валидация бэкенда). После применения ядро сбрасывает платёжные сессии —
// оплата инициализируется заново на шаге Payment.
export async function applyCartBonus(amount: number): Promise<string | null> {
  const cartId = await getCartId()
  if (!cartId) {
    return "No existing cart found"
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.client.fetch(`/store/carts/${cartId}/bonus`, {
      method: "POST",
      body: { amount },
      headers,
    })
  } catch (e: any) {
    return e?.message ?? "Could not apply bonuses"
  }

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
  return null
}

// Снять бонусы с корзины (идемпотентен).
export async function removeCartBonus(): Promise<void> {
  const cartId = await getCartId()
  if (!cartId) {
    return
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.client
    .fetch(`/store/carts/${cartId}/bonus`, {
      method: "DELETE",
      headers,
    })
    .catch(medusaError)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}
