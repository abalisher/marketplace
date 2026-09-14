import { AssistantContext } from "../types"

// Количество позиции корзины: разбор аргумента модели + guard сильного
// округления (T2.3a). Общий хелпер add_to_cart и update_cart_item — правила
// денег одни на оба инструмента (ревью T2.3a: guard, живущий только в
// add_to_cart, обходился через «поменяй количество на 0.11»).

export const MAX_QUANTITY = 100000

export type QuantityParse =
  | { ok: true; requested: number }
  | { ok: false; error: string }

// Разбор количества. Невалидное значение — ошибка модели (переспросит), а НЕ
// молчаливый дефолт: NaN («0,11» с запятой), отрицательное и сверхбольшое
// количество превращались в тихое «добавил 1»/«добавил 100000» — деньги.
export const parseQuantity = (
  raw: unknown,
  opts: { defaultToOne?: boolean } = {}
): QuantityParse => {
  if (raw === undefined || raw === null) {
    return opts.defaultToOne
      ? { ok: true, requested: 1 }
      : { ok: false, error: "Не указано количество." }
  }
  const n = Number(raw)
  if (!Number.isFinite(n)) {
    return {
      ok: false,
      error:
        `Количество «${String(raw)}» не распознано. Передай число, дробную ` +
        "часть отделяй точкой (например 0.11).",
    }
  }
  if (n <= 0) {
    return {
      ok: false,
      error:
        "Количество должно быть больше нуля. Уменьшить позицию — " +
        "update_cart_item, убрать совсем — remove_from_cart.",
    }
  }
  if (n > MAX_QUANTITY) {
    return {
      ok: false,
      error:
        `Количество ${n} неправдоподобно велико (максимум ${MAX_QUANTITY}). ` +
        "Уточни количество у покупателя.",
    }
  }
  return { ok: true, requested: n }
}

// Guard сильного округления вверх (Ф-прогон T2.3: 0,11 т арматуры молча стали
// тонной, +400 тыс. ₸). Целевое целое заметно больше запрошенного → операция
// блокируется, модель обязана спросить подтверждение; повтор по тому же
// варианту В ТОМ ЖЕ ходе блокируется детерминированно через контекст (LLM
// игнорирует текстовые запреты в ошибке). Возвращает объект-ошибку для модели
// либо null (округление допустимо, операция продолжается).
export const strongRoundingGuard = (
  context: AssistantContext,
  variantId: string,
  requested: number
): Record<string, unknown> | null => {
  const quantity = Math.ceil(requested)
  context.roundingGuardVariants ??= new Set()
  if (context.roundingGuardVariants.has(variantId)) {
    return {
      error:
        "Операция с этой позицией в текущем ходе заблокирована: покупатель " +
        "ещё не ответил на вопрос об округлении. Заверши ход вопросом — " +
        "продолжить можно в следующем ходе, после его согласия.",
    }
  }
  if (quantity > requested * 1.25) {
    context.roundingGuardVariants.add(variantId)
    return {
      error:
        `Количество ${requested} округлится вверх до целого ${quantity} — ` +
        "заметно больше запрошенного (товар продаётся целыми единицами). " +
        "Операция в этом ходе заблокирована. Ответь покупателю: назови " +
        `целое количество ${quantity}, цену и сумму — и спроси, согласен ли ` +
        "он. После его «да» (следующим ходом) повтори вызов с целым " +
        "количеством.",
      requested_quantity: requested,
      rounded_quantity: quantity,
    }
  }
  return null
}

// Note об округлении для результата успешной операции (лёгкое округление
// ≤ ×1.25 проходит без подтверждения, но покупателю о нём сообщаем).
export const roundingNote = (
  requested: number,
  quantity: number
): Record<string, unknown> =>
  quantity !== requested
    ? {
        rounded_up_from: requested,
        note:
          `Количество округлено вверх до целого: ${requested} → ${quantity}. ` +
          "Скажи об этом покупателю и назови фактический итог.",
      }
    : {}
