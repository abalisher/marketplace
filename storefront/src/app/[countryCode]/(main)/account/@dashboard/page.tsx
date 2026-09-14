import { redirect } from "next/navigation"

// «Аккаунт» вошедшего покупателя — это кабинет клиента (T10.6). Обзора-дубля
// над списком заказов не держим: он повторял тот же список и добавлял шаг.
// Гостю на этом адресе по-прежнему показывается вход (слот @login).
export default async function AccountOverviewPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  redirect(`/${countryCode}/cabinet/orders`)
}
