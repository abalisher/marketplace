import { MedusaContainer } from "@medusajs/framework/types"
import {
  addShippingMethodToCartWorkflow,
  listShippingOptionsForCartWorkflow,
  updateCartWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  readCartDeliverySlot,
  saveCartDeliverySlot,
} from "../../logistics/cart-delivery-slot"
import {
  formatDeliverySlot,
  listDeliverySlots,
  parseDeliverySlot,
} from "../../logistics/delivery-slots"
import { AssistantContext, AssistantTool } from "../types"
import {
  BuyerAddress,
  checkoutEmail,
  readBuyerIdentity,
  requireLogin,
  saveBuyerProfile,
} from "./buyer-identity"
import { summarizeCart } from "./cart-summary"

// Инструмент ассистента «оформить доставку» (срез 5, подзадача 1 — предусловие
// оформления заказа, БЕЗ денег). Записывает адрес доставки покупателя на корзину
// и подбирает способ доставки. Тонкие обёртки над ядровыми cart-workflow'ами
// (updateCart + listShippingOptionsForCart + addShippingMethodToCart) — логику
// доставки/корзины НЕ дублируем (CLAUDE.md). После пивота 2026-07-22 единственный
// способ получения — доставка: берём первую доступную опцию для корзины (единый
// магазин, одна сетка доставки). Реальная стоимость по тарифу зон — уже в цене
// shipping-option/тарифе logistics; здесь только фиксируем адрес+метод.
//
// T5.6: здесь же покупатель выбирает СЛОТ доставки (дата + окно). Слот —
// предусловие оплаты: раньше покупатель отдавал деньги и не узнавал, когда
// ждать машину (блокер №1 обеих персон-покупателей в Ф-прогоне 2026-09-02).
// Инструмент не выдумывает окна: доступные слоты считает домен
// (lib/logistics/delivery-slots.ts), а без выбранного слота оформление
// возвращает список вариантов вместо продолжения.
//
// T10.8: это ПЕРВЫЙ шаг оформления, поэтому здесь же стоит гейт входа. Гость
// получает в ленте кнопку входа по номеру и ошибку-подсказку; у вошедшего
// недостающие поля берутся из профиля (телефон + ФИО + адрес), а названное им
// сохраняется обратно в профиль — следующий заказ спрашивает только
// подтверждение адреса. Email покупателя больше НЕ спрашиваем: ядру он нужен на
// completeCart, и мы собираем его из номера телефона (см. buyer-identity).

const DEFAULT_COUNTRY = "kz"

// Магазин один и работает по Астане: город не спрашиваем у покупателя (вопрос
// «в какой город доставка?» в астанинском магазине звучит абсурдно — находка
// владельца 2026-08-03), а подставляем сами. Модель может передать город, если
// покупатель назвал его сам.
const DEFAULT_CITY = "Астана"

// Обязательные поля адреса для оформления (ядро требует их на completeCart).
// `city` в этот список НЕ входит: он всегда есть — либо от покупателя, либо
// подставлен по умолчанию. Поле, которого нет ни в реплике, ни в профиле, —
// единственное, что ассистент спрашивает.
const REQUIRED_FIELDS = [
  "first_name",
  "last_name",
  "address_1",
  "phone",
] as const

const str = (raw: unknown): string =>
  typeof raw === "string" ? raw.trim() : ""

export const setDeliveryTool: AssistantTool = {
  declaration: {
    name: "set_delivery",
    description:
      "Сохранить адрес доставки покупателя и выбрать способ доставки для " +
      "корзины. Используй, когда покупатель подтвердил состав корзины и готов " +
      "оформлять. Требует входа покупателя: гостю инструмент вернёт " +
      "login_required, а в чате появится кнопка входа по номеру. Передавай " +
      "ТОЛЬКО то, что покупатель назвал в диалоге: имя, фамилия, телефон и " +
      "адрес, которые уже есть в его профиле, подставятся сами — переспрашивать " +
      "их не нужно. Город спрашивать не нужно: магазин работает по Астане. " +
      "Здесь же выбирается СЛОТ доставки: если slot_date/slot_window не " +
      "переданы, инструмент вернёт available_slots — предложи покупателю " +
      "ближайшие варианты и вызови инструмент ещё раз с выбранным слотом. " +
      "Возвращает адрес, слот, выбранный способ доставки и список полей, " +
      "которых не хватило.",
    parameters: {
      type: "OBJECT",
      properties: {
        first_name: {
          type: "STRING",
          description: "Имя получателя (опц., если уже есть в профиле).",
        },
        last_name: {
          type: "STRING",
          description: "Фамилия получателя (опц., если уже есть в профиле).",
        },
        phone: {
          type: "STRING",
          description:
            "Контактный телефон получателя (опц.: по умолчанию номер, по " +
            "которому покупатель вошёл).",
        },
        address_1: {
          type: "STRING",
          description:
            "Улица, дом, квартира/офис (опц., если адрес уже есть в профиле).",
        },
        city: {
          type: "STRING",
          description:
            "Город (опц.). Не спрашивай — по умолчанию Астана; передавай, " +
            "только если покупатель сам назвал другой город.",
        },
        postal_code: { type: "STRING", description: "Почтовый индекс (опц.)." },
        slot_date: {
          type: "STRING",
          description:
            "Дата доставки в формате YYYY-MM-DD — ровно то значение поля " +
            "`date` из available_slots. Свои даты не придумывай.",
        },
        slot_window: {
          type: "STRING",
          description:
            "Окно доставки: morning (09:00–13:00), day (13:00–17:00) или " +
            "evening (17:00–21:00) — значение поля `window` из available_slots.",
        },
      },
      required: [],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.cartId) {
      return {
        error:
          "Корзина пуста. Сначала добавь товары через add_to_cart, потом " +
          "оформляй доставку.",
      }
    }

    // Гейт входа (T10.8): оформление — только для вошедшего покупателя.
    // Кнопку входа кладём в ленту, покупатель возвращается в тот же диалог.
    if (!context.customerId) {
      return requireLogin(
        context,
        "Оформление доступно после входа по номеру телефона. Кнопка входа уже " +
          "показана покупателю в чате — попроси его войти; корзина сохранится, " +
          "а имя, телефон и адрес подставятся из профиля."
      )
    }

    const identity = await readBuyerIdentity(container, context.customerId)
    if (!identity) {
      return requireLogin(
        context,
        "Не удалось прочитать профиль покупателя — попроси его войти заново " +
          "по кнопке в чате."
      )
    }

    // Порядок источников: что покупатель назвал в этом диалоге → что уже
    // сохранено в адресе доставки → что есть в учётке. Так названное сейчас
    // всегда побеждает, а всё остальное не переспрашивается.
    const saved = identity.address
    const address: BuyerAddress & { country_code: string } = {
      first_name: str(args.first_name) || saved?.first_name || identity.first_name,
      last_name: str(args.last_name) || saved?.last_name || identity.last_name,
      phone: str(args.phone) || saved?.phone || identity.phone,
      address_1: str(args.address_1) || saved?.address_1 || "",
      city: str(args.city) || saved?.city || DEFAULT_CITY,
      postal_code: str(args.postal_code) || saved?.postal_code || "",
      country_code: DEFAULT_COUNTRY,
    }

    const missing = REQUIRED_FIELDS.filter((f) => !address[f])
    if (missing.length) {
      return {
        error: `Не хватает данных адреса: ${missing.join(", ")}. Спроси у покупателя только их.`,
        missing_fields: missing,
      }
    }

    await updateCartWorkflow(container).run({
      input: {
        id: context.cartId,
        shipping_address: address,
        // Email покупателя на MVP не спрашиваем: у входа по номеру его нет, а
        // ядру он нужен на completeCart — собираем служебный из номера
        // (buyer-identity.checkoutEmail). Настоящая почта учётки email-эпохи
        // имеет приоритет.
        email: checkoutEmail(identity),
      },
    })

    // Опции доставки для корзины (после адреса — зоны резолвятся по стране).
    const { result: options } = await listShippingOptionsForCartWorkflow(
      container
    ).run({ input: { cart_id: context.cartId } })

    const option = (options as { id: string; name?: string }[])[0]
    if (!option) {
      return {
        error:
          "Для этого адреса нет доступного способа доставки. Проверь адрес " +
          "или обратись в поддержку.",
      }
    }

    await addShippingMethodToCartWorkflow(container).run({
      input: { cart_id: context.cartId, options: [{ id: option.id }] },
    })


    // Данные оформления уходят в профиль: следующий заказ спросит только
    // подтверждение адреса (DoD T10.8). Сбой сохранения профиля не должен
    // ронять оформление — адрес уже на корзине, доставка подобрана.
    const { country_code: _country, ...profileAddress } = address
    try {
      await saveBuyerProfile(container, identity, profileAddress)
    } catch {
      // Профиль не обновился — покупатель просто назовёт адрес ещё раз в
      // следующий заказ; текущее оформление продолжается.
    }

    // Слот доставки (T5.6). Проверяется ПОСЛЕ записи профиля — гейт слота
    // прерывает оформление, и если бы адрес не успел уйти в профиль, повторный
    // вызов (уже только со слотом) снова спросил бы ФИО и улицу. Порядок
    // источников тот же, что у адреса: названное сейчас → уже выбранное на
    // этой корзине.
    const now = new Date()
    const chosen = await readCartDeliverySlot(container, context.cartId)
    const slot =
      parseDeliverySlot(args.slot_date, args.slot_window, now) ??
      parseDeliverySlot(chosen.date, chosen.window, now)

    if (!slot) {
      // Оформление останавливается ЗДЕСЬ, до счёта: покупатель должен узнать
      // срок раньше, чем отдаст деньги (блокер Ф-прогона 2026-09-02).
      return {
        error:
          "Слот доставки не выбран. Назови покупателю 2–3 ближайших варианта " +
          "из available_slots (поле label — готовая формулировка) и спроси, " +
          "какой ему подходит. Потом вызови set_delivery ещё раз с slot_date " +
          "и slot_window выбранного варианта.",
        missing_fields: ["delivery_slot"],
        // Адрес уже сохранён и на корзине, и в профиле — повторный вызов
        // спросит только окно.
        delivery: { address: profileAddress },
        available_slots: listDeliverySlots(now),
      }
    }

    await saveCartDeliverySlot(container, context.cartId, slot)

    const summary = await summarizeCart(container, context.cartId)
    return {
      delivery: {
        address: profileAddress,
        method: option.name ?? "Доставка",
        slot: {
          date: slot.date,
          window: slot.window,
          // Готовая формулировка: своё «6 сентября с 13 до 17» модель
          // пересобирала бы каждый раз по-разному, а часы окна выдумывала.
          label: formatDeliverySlot(slot, now),
        },
      },
      cart: summary,
    }
  },
}
