import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Пустое состояние раздела кабинета: заголовок, подсказка и один выход в чат.
// Тупика быть не должно — в этом магазине всё начинается с разговора, поэтому
// кнопка ведёт к ассистенту, а не в каталог.
const CabinetEmpty = ({
  title,
  hint,
  action,
}: {
  title: string
  hint: string
  action?: string
}) => (
  <div
    className="flex flex-col items-start gap-3 rounded-card border border-dashed border-line bg-surface p-6"
    data-testid="cabinet-empty"
  >
    <span className="text-title-medium text-ink">{title}</span>
    <p className="text-body-large text-ink-secondary">{hint}</p>
    {action && (
      <LocalizedClientLink
        href="/chat"
        className="flex min-h-[48px] items-center text-body-large font-semibold text-accent transition-colors hover:text-accent-pressed"
        data-testid="cabinet-empty-action"
      >
        {action}
      </LocalizedClientLink>
    )}
  </div>
)

export default CabinetEmpty
