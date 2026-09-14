import { redirect } from "next/navigation"

// Корень кабинета — сразу заказы: это то, за чем сюда приходят (DoD T10.6 —
// найти прошлый заказ и его накладную). Отдельного «обзора» не делаем: он
// повторял бы список заказов и добавлял лишний шаг.
export default async function CabinetPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  redirect(`/${countryCode}/cabinet/orders`)
}
