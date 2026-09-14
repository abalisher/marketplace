import { redirect } from "next/navigation"

// Адреса доставки живут в профиле кабинета (T10.6) — отдельной страницы у них
// больше нет: покупатель правит адрес там же, где ФИО и телефон.
export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  redirect(`/${countryCode}/cabinet/profile`)
}
