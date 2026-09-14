import { redirect } from "next/navigation"

// Карточка заказа переехала в кабинет (T10.6). Редирект держим: ссылку
// `/account/orders/details/:id` покупатель мог сохранить, и она приходила в
// старых вставках ленты.
export default async function OrderDetailPage(props: {
  params: Promise<{ countryCode: string; id: string }>
}) {
  const { countryCode, id } = await props.params
  redirect(`/${countryCode}/cabinet/orders/${id}`)
}
