import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createCustomerAddressesWorkflow,
  updateCustomerAddressesWorkflow,
  updateCustomersWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  AssistantContext,
  AuthPromptAttachment,
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
    ],
    filters: { id: customerId },
  })

  const customer = (data as CustomerRow[])[0]
  if (!customer) {
    return null
  }

  const addresses = customer.addresses ?? []
  // Адрес по умолчанию, а если его не отметили — первый: покупатель на MVP
  // возит на один адрес, и «последний, куда везли» полезнее пустоты.
  const row = addresses.find((a) => a.is_default_shipping) ?? addresses[0]

  return {
    customer_id: customer.id,
    phone: str(customer.phone),
    first_name: str(customer.first_name),
    last_name: str(customer.last_name),
    email: str(customer.email),
    address_id: row?.id ?? null,
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

// Сохранить данные оформления в профиль: ФИО и телефон — в учётку, адрес — в
// адресную книгу как адрес доставки по умолчанию. Благодаря этому следующий
// заказ спрашивает только подтверждение адреса (DoD T10.8).
export const saveBuyerProfile = async (
  container: MedusaContainer,
  identity: BuyerIdentity,
  address: BuyerAddress
): Promise<void> => {
  const update: Record<string, string> = {}
  if (address.first_name && address.first_name !== identity.first_name) {
    update.first_name = address.first_name
  }
  if (address.last_name && address.last_name !== identity.last_name) {
    update.last_name = address.last_name
  }
  // Телефон учётки — ключ входа по номеру (T10.7), перезаписывать его контактным
  // телефоном получателя нельзя: покупатель мог назвать номер прораба на объекте.
  // Проставляем, только если в учётке его почему-то нет.
  if (!identity.phone && address.phone) {
    update.phone = address.phone
  }

  if (Object.keys(update).length) {
    await updateCustomersWorkflow(container).run({
      input: { selector: { id: identity.customer_id }, update },
    })
  }

  const addressInput = {
    first_name: address.first_name,
    last_name: address.last_name,
    phone: address.phone,
    address_1: address.address_1,
    city: address.city,
    postal_code: address.postal_code,
    country_code: "kz",
  }

  if (identity.address_id) {
    await updateCustomerAddressesWorkflow(container).run({
      input: {
        selector: { id: identity.address_id },
        update: addressInput,
      },
    })
    return
  }

  await createCustomerAddressesWorkflow(container).run({
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
}
