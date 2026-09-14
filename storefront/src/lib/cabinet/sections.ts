// Разделы кабинета клиента (T10.6). Один список на витрину: по нему рисуются и
// ссылки в рельсе истории, и ряд-переключатель над содержимым — расхождение
// между ними было бы заметно сразу.
export const CABINET_SECTIONS = [
  { key: "orders", href: "/cabinet/orders" },
  { key: "cart", href: "/cabinet/cart" },
  { key: "documents", href: "/cabinet/documents" },
  { key: "profile", href: "/cabinet/profile" },
] as const

export type CabinetSectionKey = (typeof CABINET_SECTIONS)[number]["key"]
