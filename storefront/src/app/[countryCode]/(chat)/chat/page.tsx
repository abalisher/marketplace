import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { getStorefrontTenant } from "@lib/data/tenant"
import { resolveTheme } from "@lib/theme/resolve-theme"
import ChatTemplate from "@modules/assistant/templates/chat-template"

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "Chat with the building-materials assistant: pick materials, calculate quantities, order with delivery.",
}

// Разговорный вход покупателя (пивот №3) и точка входа витрины. Тонкая оболочка
// над POST /store/assistant/chat — вся логика в бэкенде. Тема резолвится здесь:
// переключатель живёт в панели диалогов, потому что футера на этом экране нет.
// Покупателя читаем только чтобы знать, показывать ли ссылку «Открыть заказ» в
// ленте: гостю страница заказа в «Аккаунте» недоступна (T3.9), — и чья на
// устройстве история диалогов. Продавец витрины (компания или площадка) —
// из lib/data/tenant.ts.
export default async function ChatPage() {
  const [theme, customer, tenant] = await Promise.all([
    resolveTheme(),
    retrieveCustomer(),
    getStorefrontTenant(),
  ])

  return (
    <ChatTemplate
      theme={theme}
      isAuthenticated={!!customer}
      customerId={customer?.id ?? null}
      store={tenant && { slug: tenant.slug, name: tenant.name }}
    />
  )
}
