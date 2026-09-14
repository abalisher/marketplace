import { redirect } from "next/navigation"

// Заказы переехали в кабинет клиента (T10.6): он живёт в оболочке чата, рядом
// с историей диалогов. Стартерная страница осталась только как редирект —
// на неё ведут старые ссылки (письма ядра, закладки покупателя).
export default async function Orders(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  redirect(`/${countryCode}/cabinet/orders`)
}
