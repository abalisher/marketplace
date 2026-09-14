"use client"

import {
  AssistantCartSummary,
  getAssistantCart,
  setAssistantCartQuantities,
} from "@lib/data/assistant"
import { useCallback, useEffect, useRef, useState } from "react"

// Корзина чата на стороне клиента (T10.15). Счётчики «−/+» на карточках подбора
// пишут в корзину напрямую, без хода модели, поэтому состав корзины стал
// состоянием ЭКРАНА, а не только диалога.
//
// Три правила, на которых держится честность цифр:
//  * показываем ОПТИМИСТИЧНО — нажатие двигает счётчик мгновенно, иначе кнопка
//    ощущается сломанной; правда с сервера приходит следом и заменяет показ;
//  * шлём АБСОЛЮТНОЕ количество с дебаунсом: серия нажатий «+ + + +»
//    схлопывается в один запрос, а последняя запись побеждает — гонок нет;
//  * ошибка ОТКАТЫВАЕТ счётчик к последнему подтверждённому серверу значению:
//    цифра на экране, которой нет в корзине, — это счёт-сюрприз на оформлении.
//
// Корзину меняет и сам ассистент (add_to_cart и правки) — после хода состав
// перечитывается отдельным запросом.

// Пауза перед отправкой: столько покупатель обычно докликивает количество.
const FLUSH_DELAY_MS = 450

const quantitiesOf = (cart: AssistantCartSummary | null) => {
  const map: Record<string, number> = {}
  for (const line of cart?.items ?? []) {
    map[line.variant_id] = line.quantity
  }
  return map
}

export type AssistantCartController = {
  // Состав корзины по данным сервера (для полосы корзины и итога).
  cart: AssistantCartSummary | null
  // Что показывать на счётчиках: серверные количества, поверх которых лежат
  // ещё не отправленные нажатия.
  quantities: Record<string, number>
  isBusy: boolean
  hasError: boolean
  setQuantity: (variantId: string, next: number) => void
  refresh: (cartId?: string) => void
  reset: () => void
}

export const useAssistantCart = ({
  cartId,
  onCartId,
}: {
  cartId?: string
  // Первое «+» гостя создаёт корзину — её id клиент обязан положить рядом с
  // историей диалога и слать следующим ходом (та же идиома, что у чата).
  onCartId: (cartId: string) => void
}): AssistantCartController => {
  const [cart, setCart] = useState<AssistantCartSummary | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isBusy, setIsBusy] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Нажатия, ещё не отправленные на сервер: variant_id → целевое количество.
  const pendingRef = useRef<Map<string, number>>(new Map())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFlushingRef = useRef(false)
  // Последние ПОДТВЕРЖДЁННЫЕ сервером количества — точка отката при ошибке.
  const confirmedRef = useRef<Record<string, number>>({})
  const cartIdRef = useRef<string | undefined>(cartId)
  const onCartIdRef = useRef(onCartId)

  useEffect(() => {
    cartIdRef.current = cartId
  }, [cartId])
  useEffect(() => {
    onCartIdRef.current = onCartId
  }, [onCartId])

  const applySummary = useCallback(
    (next: AssistantCartSummary, nextCartId: string | null) => {
      setCart(next)
      confirmedRef.current = quantitiesOf(next)
      if (nextCartId && nextCartId !== cartIdRef.current) {
        cartIdRef.current = nextCartId
        onCartIdRef.current(nextCartId)
      }
      // Пока есть неотправленные нажатия, показ не трогаем: покупатель уже
      // кликнул дальше, и «правда» сервера отстала от его намерения.
      if (pendingRef.current.size === 0) {
        setQuantities(confirmedRef.current)
      }
    },
    []
  )

  const flush = useCallback(async () => {
    if (isFlushingRef.current || pendingRef.current.size === 0) {
      return
    }
    const items = Array.from(pendingRef.current, ([variant_id, quantity]) => ({
      variant_id,
      quantity,
    }))
    pendingRef.current.clear()
    isFlushingRef.current = true
    setIsBusy(true)
    try {
      const res = await setAssistantCartQuantities({
        cart_id: cartIdRef.current,
        items,
      })
      setHasError(false)
      applySummary(res.cart, res.cart_id)
    } catch {
      // Запись не прошла — возвращаем счётчики к подтверждённому состоянию.
      pendingRef.current.clear()
      setQuantities(confirmedRef.current)
      setHasError(true)
    } finally {
      isFlushingRef.current = false
      setIsBusy(false)
      // Пока шёл запрос, покупатель мог кликнуть ещё — досылаем.
      if (pendingRef.current.size > 0) {
        void flush()
      }
    }
  }, [applySummary])

  const setQuantity = useCallback(
    (variantId: string, next: number) => {
      const target = Math.max(0, Math.round(next))
      setQuantities((current) => ({ ...current, [variantId]: target }))
      pendingRef.current.set(variantId, target)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        void flush()
      }, FLUSH_DELAY_MS)
    },
    [flush]
  )

  // Перечитать состав (после хода модели: корзину мог поменять ассистент).
  const refresh = useCallback(
    (nextCartId?: string) => {
      cartIdRef.current = nextCartId
      if (!nextCartId) {
        setCart(null)
        confirmedRef.current = {}
        setQuantities({})
        return
      }
      void getAssistantCart(nextCartId)
        .then((res) => applySummary(res.cart, res.cart_id))
        .catch(() => {
          // Не смогли прочитать — молча оставляем прежний показ: ассистент
          // всё равно говорит о корзине по своим данным.
        })
    },
    [applySummary]
  )

  // Новый диалог: корзина начинается с нуля, неотправленные нажатия отменяются.
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    pendingRef.current.clear()
    confirmedRef.current = {}
    cartIdRef.current = undefined
    setCart(null)
    setQuantities({})
    setHasError(false)
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    },
    []
  )

  return {
    cart,
    quantities,
    isBusy,
    hasError,
    setQuantity,
    refresh,
    reset,
  }
}
