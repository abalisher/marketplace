import { redirect } from "next/navigation"

// Профиль переехал в кабинет клиента (T10.6): ФИО, телефон и адреса теперь на
// одной странице рядом с заказами. Старый адрес — редирект.
export default async function Profile(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  redirect(`/${countryCode}/cabinet/profile`)
}
