import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GeoPoint, geoFromMetadata, geoPoint } from "../../geo"
import {
  createCustomerAddressesWorkflow,
  updateCustomerAddressesWorkflow,
  updateCustomersWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  AssistantContext,
  AuthPromptAttachment,
  DeliveryFormAttachment,
} from "../types"

// Личность покупателя на шаге оформления (T10.8). Оформление доступно ТОЛЬКО
// вошедшему: гость собирает корзину, а на переходе к оформлению получает в
// ленте кнопку входа по номеру. Профиль MVP — телефон + ФИО + адрес: то, что в
// нём уже есть, ассистент не переспрашивает, недостающее спрашивает один раз и
// сохраняет обратно в профиль (повторный заказ не спрашивает ничего).
//
// Здесь же живёт ответ на «хвост T10.7»: в профиле входа по номеру email НЕТ, а
// ядровое оформление (completeCart) требует `cart.email`. Решение — служебный
// адрес из номера телефона (см. `checkoutEmail`).

export type BuyerAddress = {
  first_name: string
  last_name: string
  phone: string
  address_1: string
  city: string
  postal_code: string
}

export type BuyerIdentity = {
  customer_id: string
  phone: string
  first_name: string
  last_name: string
  // Настоящий email учётки email-эпохи; у покупателя, вошедшего по номеру, его нет.
  email: string
  // Адрес доставки по умолчанию, если покупатель уже оформлял заказ.
  address: BuyerAddress | null
  // Точка адреса на карте (булавка 2ГИС), если покупатель выбирал адрес на
  // карте. Отдельно от адреса: в ответы модели и форму доставки она не идёт.
  address_geo: GeoPoint | null
  address_id: string | null
}

type AddressRow = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  address_1?: string | null
  city?: string | null
  postal_code?: string | null
  is_default_shipping?: boolean | null
  metadata?: Record<string, unknown> | null
  created_at?: string | Date | null
}

type CustomerRow = {
  id: string
  email?: string | null
  phone?: string | null
  first_name?: string | null
  last_name?: string | null
  addresses?: AddressRow[]
}

const str = (raw: unknown): string =>
  typeof raw === "string" ? raw.trim() : ""

// Служебный домен для адреса, собранного из номера телефона. `.invalid`
// зарезервирован RFC 2606 и заведомо не существует: письмо по нему НЕ уйдёт
// никуда и никто (ни покупатель, ни оператор в панели) не примет его за
// настоящую почту. Платформа рассылок не делает — документы покупатель получает
// ссылками в чате, — поэтому подставить технический адрес честнее, чем
// спрашивать email, который никому не нужен, или чинить ядро ради MVP.
export const PHONE_EMAIL_DOMAIN = "phone.invalid"

// Почта, которой у человека нет: её выдаёт система покупателю, вошедшему по
// телефону (ядру Medusa адрес нужен обязательно). Показывать её сотруднику
// нельзя — он прочитает её как настоящий контакт покупателя.
export const isSystemPhoneEmail = (email?: string | null): boolean =>
  !!email && email.trim().toLowerCase().endsWith(`@${PHONE_EMAIL_DOMAIN}`)

// Email для корзины: настоящий адрес учётки, если он есть (учётки email-эпохи),
// иначе служебный из номера. Ядру нужен `cart.email` на completeCart — это
// единственное место, где он берётся.
export const checkoutEmail = (identity: BuyerIdentity): string => {
  if (identity.email) {
    return identity.email
  }
  const digits = identity.phone.replace(/\D/g, "")
  return `${digits || identity.customer_id}@${PHONE_EMAIL_DOMAIN}`
}

// Профиль вошедшего покупателя: ФИО, телефон и адрес доставки по умолчанию.
// Покупателя нет (учётку удалили) → null: инструмент попросит войти заново.
export const readBuyerIdentity = async (
  container: MedusaContainer,
  customerId: string
): Promise<BuyerIdentity | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "customer",
    fields: [
      "id",
      "email",
      "phone",
      "first_name",
      "last_name",
      "addresses.id",
      "addresses.first_name",
      "addresses.last_name",
      "addresses.phone",
      "addresses.address_1",
      "addresses.city",
      "addresses.postal_code",
      "addresses.is_default_shipping",
      "addresses.metadata",
      "addresses.created_at",
    ],
    filters: { id: customerId },
  })

  const customer = (data as CustomerRow[])[0]
  if (!customer) {
    return null
  }

  const addresses = customer.addresses ?? []
  // Адрес по умолчанию, а если его не отметили — самый свежий: покупатель
  // добавляет адрес, чтобы на него и везли («последний» полезнее случайного).
  const newest = [...addresses].sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  )[0]
  const row = addresses.find((a) => a.is_default_shipping) ?? newest

  return {
    customer_id: customer.id,
    phone: str(customer.phone),
    first_name: str(customer.first_name),
    last_name: str(customer.last_name),
    email: str(customer.email),
    address_id: row?.id ?? null,
    address_geo: geoFromMetadata(row?.metadata),
    address: row
      ? {
          first_name: str(row.first_name),
          last_name: str(row.last_name),
          phone: str(row.phone),
          address_1: str(row.address_1),
          city: str(row.city),
          postal_code: str(row.postal_code),
        }
      : null,
  }
}

// Просьба войти: кладёт в ленту вставку с кнопкой входа и возвращает модели
// ошибку с объяснением. Вставка одна на ход (свёртка в attachments.ts), поэтому
// сработавшие подряд guard'ы не нарисуют покупателю две кнопки.
export const requireLogin = (
  context: AssistantContext,
  reason: string
): Record<string, unknown> => {
  const prompt: AuthPromptAttachment = { type: "auth_prompt", reason: "checkout" }
  context.attachments?.push(prompt)
  return {
    error: reason,
    login_required: true,
  }
}

// Что из профиля покупателя ещё не заполнено (для подсказки модели: спросить
// ровно недостающее и ровно один раз).
export const missingProfileFields = (
  identity: BuyerIdentity
): string[] => {
  const missing: string[] = []
  if (!identity.first_name && !identity.address?.first_name) {
    missing.push("first_name")
  }
  if (!identity.last_name && !identity.address?.last_name) {
    missing.push("last_name")
  }
  if (!identity.address?.address_1) {
    missing.push("address_1")
  }
  // У входа по номеру телефон есть всегда; пусто он бывает только у учётки
  // email-эпохи, вошедшей по паролю — тогда контакт для курьера надо спросить.
  if (!identity.phone && !identity.address?.phone) {
    missing.push("phone")
  }
  return missing
}

// Один ли это адрес: «ул. Асфендиярова, д. 11» = «Асфендиярова 11». Модель
// пересказывает адрес по-своему, и строгое сравнение заводило бы «новый» адрес
// (и теряло точку с карты) из-за запятой или «ул.».
const ADDRESS_NOISE = new Set(["ул", "улица", "пр", "пр-т", "проспект", "д", "дом"])
export const sameAddressText = (a: string | null | undefined, b: string | null | undefined) => {
  const key = (value: string | null | undefined) =>
    (value ?? "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .split(/[\s,.]+/)
      .filter((word) => word && !ADDRESS_NOISE.has(word))
      .join(" ")
  return !!key(a) && key(a) === key(b)
}

// Город по умолчанию: магазин работает по Астане, город не спрашиваем.
export const DEFAULT_CITY = "Астана"

export type BuyerProfileInput = {
  first_name?: string
  last_name?: string
  // Контактный телефон получателя — ложится ТОЛЬКО в адрес доставки.
  phone?: string
  address_1?: string
  city?: string
  postal_code?: string
  // Точка, выбранная на карте (булавка 2ГИС).
  lat?: number
  lng?: number
}

// Сохранить данные оформления в профиль — целиком или частично (покупатель
// назвал только имя, форма в чате прислала только адрес): ФИО — в учётку, адрес
// — в адресную книгу как адрес доставки по умолчанию. Следующий заказ
// спрашивает только подтверждение адреса (DoD T10.8).
//
// - Телефон учётки не трогаем НИКОГДА: это ключ входа по номеру (T10.7), и
//   сменить его можно только через SMS-код. Иначе учётка email-эпохи без
//   телефона «присвоила» бы чужой номер, и владелец номера при первом входе
//   попал бы в чужой кабинет. Названный телефон — контакт получателя в адресе.
// - Адрес без имени получателя не заводим: заглушка вместо имени уехала бы в
//   накладную. Имя спросится, адрес сохранится вместе с ним.
// - Другая улица — новая запись адресной книги (по умолчанию), а не правка
//   прежней: «в этот раз на дачу» не должно стирать домашний адрес.
//
// Ошибки записи не глушим: инструмент вернёт их модели, и она не скажет
// покупателю «сохранено», когда ничего не сохранилось.
export const saveBuyerProfile = async (
  container: MedusaContainer,
  identity: BuyerIdentity,
  input: BuyerProfileInput
): Promise<BuyerIdentity> => {
  const firstName = str(input.first_name)
  const lastName = str(input.last_name)

  const update: Record<string, string> = {}
  if (firstName && firstName !== identity.first_name) {
    update.first_name = firstName
  }
  if (lastName && lastName !== identity.last_name) {
    update.last_name = lastName
  }
  if (Object.keys(update).length) {
    await updateCustomersWorkflow(container).run({
      input: { selector: { id: identity.customer_id }, update },
    })
  }

  const saved: BuyerIdentity = {
    ...identity,
    first_name: firstName || identity.first_name,
    last_name: lastName || identity.last_name,
  }

  const address1 = str(input.address_1)
  const recipientFirstName = firstName || saved.first_name || identity.address?.first_name || ""
  if (!address1 || !recipientFirstName) {
    return saved
  }

  const sameAddress =
    !!identity.address_id && sameAddressText(identity.address?.address_1, address1)
  const address: BuyerAddress = {
    first_name: recipientFirstName,
    last_name: lastName || saved.last_name || identity.address?.last_name || "",
    phone: str(input.phone) || identity.address?.phone || identity.phone,
    address_1: address1,
    city: str(input.city) || identity.address?.city || DEFAULT_CITY,
    postal_code:
      str(input.postal_code) || (sameAddress ? identity.address?.postal_code ?? "" : ""),
  }
  // Точка с карты: новая — пишем; не прислали, а адрес тот же — остаётся
  // прежняя (metadata не трогаем); новый адрес текстом — без точки.
  const geo = geoPoint(input.lat, input.lng)
  const addressInput = {
    ...address,
    country_code: "kz",
    ...(geo ? { metadata: { lat: geo.lat, lng: geo.lng } } : {}),
  }

  if (sameAddress) {
    await updateCustomerAddressesWorkflow(container).run({
      input: { selector: { id: identity.address_id! }, update: addressInput },
    })
    return { ...saved, address, address_geo: geo ?? identity.address_geo }
  }

  const { result } = await createCustomerAddressesWorkflow(container).run({
    input: {
      addresses: [
        {
          ...addressInput,
          customer_id: identity.customer_id,
          is_default_shipping: true,
        },
      ],
    },
  })
  return {
    ...saved,
    address,
    address_geo: geo,
    address_id: (result as { id: string }[])[0]?.id ?? null,
  }
}

// Мини-форма доставки в ленте чата: что уже известно о получателе и каких
// полей не хватает. Покупатель может ответить текстом или заполнить форму.
export const deliveryFormAttachment = (
  known: {
    first_name?: string
    last_name?: string
    phone?: string
    address_1?: string
    city?: string
  },
  missing: string[]
): DeliveryFormAttachment => ({
  type: "delivery_form",
  first_name: known.first_name ?? "",
  last_name: known.last_name ?? "",
  phone: known.phone ?? "",
  address_1: known.address_1 ?? "",
  city: known.city || DEFAULT_CITY,
  missing_fields: missing,
})

// Сохранённые данные известны — форма в ленте больше не нужна.
export const dropDeliveryForm = (context: AssistantContext): void => {
  context.attachments = context.attachments?.filter(
    (attachment) => attachment.type !== "delivery_form"
  )
}
