"use client"

import { AssistantDeliverySlots } from "@lib/data/assistant"
import { useMessages } from "@lib/i18n/i18n-context"
import { formatDeliverySlot } from "@lib/util/delivery-slot"
import { clx } from "@medusajs/ui"
import { useState } from "react"

type Slot = AssistantDeliverySlots["slots"][number]

const QUICK_COUNT = 3
const ASTANA_OFFSET_MS = 5 * 3_600_000
const DAY_MS = 24 * 3_600_000

// Сутки Астаны «сегодня» и «завтра» кодами `YYYY-MM-DD` — слоты считаются в
// них, а не в поясе браузера.
const astanaDay = (shiftDays: number) =>
  new Date(Date.now() + ASTANA_OFFSET_MS + shiftDays * DAY_MS)
    .toISOString()
    .slice(0, 10)

const CHIP =
  "flex min-h-[48px] items-center justify-center rounded-chip border px-4 py-2 text-body-medium font-semibold transition-colors disabled:opacity-50"

// Кнопки окон доставки под ответом «какое время удобно?»: три ближайших окна и
// «Другая дата» — день, затем окно из тех же доступных вариантов (магазин
// возит тремя окнами в пределах недели, произвольный час не обещаем).
// Нажатие — реплика покупателя «Доставка: 10 нояб., 17:00–21:00», слот
// сохраняет ассистент — как у кнопок способов оплаты. После выбора кнопки
// гаснут.
const DeliverySlotsAttachment = ({
  attachment,
  onPick,
}: {
  attachment: AssistantDeliverySlots
  onPick?: (message: string) => void
}) => {
  const m = useMessages()
  const t = m.assistant.slots
  const months = m.common.deliverySlot.months
  const [picked, setPicked] = useState<string | null>(null)
  const [otherOpen, setOtherOpen] = useState(false)
  const [day, setDay] = useState<string | null>(null)

  if (!attachment.slots.length) {
    return null
  }

  const today = astanaDay(0)
  const tomorrow = astanaDay(1)
  const label = (slot: Slot) => {
    const text = formatDeliverySlot(slot.date, slot.window, months) ?? ""
    const relative =
      slot.date === today ? t.today : slot.date === tomorrow ? t.tomorrow : null
    return relative ? `${relative}, ${text}` : text
  }
  const dayLabel = (date: string) => {
    const text = (formatDeliverySlot(date, "morning", months) ?? date).split(
      ","
    )[0]
    return date === today ? t.today : date === tomorrow ? t.tomorrow : text
  }
  const key = (slot: Slot) => `${slot.date}:${slot.window}`

  const pick = (slot: Slot) => {
    setPicked(key(slot))
    onPick?.(
      t.reply.replace(
        "{slot}",
        formatDeliverySlot(slot.date, slot.window, months) ?? ""
      )
    )
  }

  const disabled = picked !== null || !onPick
  const days = Array.from(new Set(attachment.slots.map((slot) => slot.date)))

  const slotButton = (slot: Slot, text: string) => (
    <button
      key={key(slot)}
      type="button"
      disabled={disabled}
      onClick={() => pick(slot)}
      className={clx(
        CHIP,
        picked === key(slot)
          ? "border-accent bg-accent/10 text-ink"
          : "border-line bg-surface text-ink hover:border-accent"
      )}
      data-testid="assistant-slot-option"
    >
      {text}
    </button>
  )

  return (
    <div
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-delivery-slots"
    >
      <div className="flex flex-col gap-1">
        <span className="text-title-medium text-ink">{t.title}</span>
        <span className="text-body-medium text-ink-secondary">{t.hint}</span>
      </div>

      {!otherOpen ? (
        <div className="flex flex-wrap gap-2">
          {attachment.slots
            .slice(0, QUICK_COUNT)
            .map((slot) => slotButton(slot, label(slot)))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOtherOpen(true)}
            className={clx(
              CHIP,
              "border-dashed border-line bg-surface text-accent hover:border-accent"
            )}
            data-testid="assistant-slot-other"
          >
            {t.other}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-body-medium text-ink-secondary">
            {t.pickDay}
          </span>
          <div className="flex flex-wrap gap-2">
            {days.map((date) => (
              <button
                key={date}
                type="button"
                disabled={disabled}
                onClick={() => setDay(date)}
                className={clx(
                  CHIP,
                  day === date
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line bg-surface text-ink hover:border-accent"
                )}
              >
                {dayLabel(date)}
              </button>
            ))}
          </div>
          {day && (
            <>
              <span className="text-body-medium text-ink-secondary">
                {t.pickWindow}
              </span>
              <div className="flex flex-wrap gap-2">
                {attachment.slots
                  .filter((slot) => slot.date === day)
                  .map((slot) =>
                    slotButton(
                      slot,
                      (
                        formatDeliverySlot(slot.date, slot.window, months) ?? ""
                      ).split(", ")[1] ?? ""
                    )
                  )}
              </div>
            </>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setOtherOpen(false)
              setDay(null)
            }}
            className="flex min-h-[48px] w-fit items-center text-body-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-50"
          >
            {t.back}
          </button>
        </div>
      )}
    </div>
  )
}

export default DeliverySlotsAttachment
