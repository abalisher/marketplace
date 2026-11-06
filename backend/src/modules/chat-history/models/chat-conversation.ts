import { model } from "@medusajs/framework/utils"

// Диалог покупателя с ассистентом — копия истории с устройства, чтобы на
// телефоне и компьютере была одна и та же лента (решение владельца
// 2026-10-29; до этого история жила только в localStorage, DECISIONS
// 2026-07-24). Хранится только у вошедшего покупателя; гость держит историю на
// своём устройстве, как раньше.
//
// Ход ассистента по-прежнему stateless: клиент сам шлёт messages, сервер их
// здесь не читает — только хранит и отдаёт. client_id — id диалога на
// устройстве: по нему копии с разных устройств сходятся в одну.
// Канал продаж — витрина диалога (у каждого продавца свои корзины и заказы).
// removed_at — диалог удалён на одном устройстве: другое не должно вернуть
// его своей старой копией, поэтому строка остаётся пометкой.
const ChatConversation = model
  .define("chat_conversation", {
    id: model.id({ prefix: "chatconv" }).primaryKey(),
    customer_id: model.text(),
    sales_channel_id: model.text(),
    client_id: model.text(),
    title: model.text(),
    title_custom: model.boolean().default(false),
    messages: model.json(),
    // Карточки ответов по месту в ленте (статус заказа, документы).
    cards: model.json().nullable(),
    cart_id: model.text().nullable(),
    order_id: model.text().nullable(),
    // Время последнего изменения на устройстве (мс) — побеждает свежая копия.
    client_updated_at: model.bigNumber(),
    removed_at: model.dateTime().nullable(),
  })
  .indexes([
    {
      on: ["customer_id", "sales_channel_id", "client_id"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default ChatConversation
