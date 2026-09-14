import { retrieveCustomer } from "@lib/data/customer"
import { resolveTheme } from "@lib/theme/resolve-theme"
import CabinetGuest from "@modules/cabinet/components/cabinet-guest"
import CabinetShell from "@modules/cabinet/templates/cabinet-shell"

// Кабинет клиента (T10.6) живёт в оболочке чата: рельс истории слева, разделы
// кабинета в нём же. Вход проверяем ОДИН раз здесь — все разделы личные, и
// гостю вместо четырёх пустых страниц показываем одно приглашение войти.
export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, customer] = await Promise.all([
    resolveTheme(),
    retrieveCustomer().catch(() => null),
  ])

  return (
    <CabinetShell theme={theme} isAuthenticated={!!customer}>
      {customer ? children : <CabinetGuest />}
    </CabinetShell>
  )
}
