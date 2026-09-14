import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
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
// ленте: гостю страница заказа в «Аккаунте» недоступна (T3.9).
export default async function ChatPage() {
  const [theme, customer] = await Promise.all([
    resolveTheme(),
    retrieveCustomer(),
  ])

  return <ChatTemplate theme={theme} isAuthenticated={!!customer} />
}
