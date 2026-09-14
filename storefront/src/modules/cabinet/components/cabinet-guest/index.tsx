import { getServerMessages } from "@lib/i18n/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Кабинет гостю: заказы, документы и корзина привязаны к учётке, поэтому
// вместо пустых разделов показываем ровно один экран — зачем входить и куда
// нажать. Вход — по номеру телефона (T10.7), это единственный основной вход.
const CabinetGuest = async () => {
  const m = await getServerMessages()

  return (
    <div
      className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-6"
      data-testid="cabinet-guest"
    >
      <h1 className="text-title-medium text-ink">{m.cabinet.guest.title}</h1>
      <p className="text-body-large text-ink-secondary">
        {m.cabinet.guest.description}
      </p>
      <LocalizedClientLink
        href="/account"
        className="flex min-h-[48px] items-center rounded-chip bg-accent px-5 text-button text-surface transition-colors hover:bg-accent-pressed"
        data-testid="cabinet-login-link"
      >
        {m.cabinet.guest.action}
      </LocalizedClientLink>
    </div>
  )
}

export default CabinetGuest
