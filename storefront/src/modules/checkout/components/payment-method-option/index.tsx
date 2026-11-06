import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import Radio from "@modules/common/components/radio"
import React from "react"

// Вариант способа оплаты на шаге оформления: название, однострочное
// пояснение и, если продавец сейчас этот способ не примет, короткая причина
// (вариант тогда неактивен). Значение радио — код способа бэкенда
// (`kaspi_qr` | `kaspi_transfer` | `debt`), а не id провайдера ядра.
const PaymentMethodOption = ({
  value,
  title,
  description,
  note,
  icon,
  unavailableReason,
  selected,
}: {
  value: string
  title: string
  description: string
  // Дополнительная строка условий (лимит долга).
  note?: string | null
  icon?: React.ReactNode
  // Причина недоступности; задана — вариант выбрать нельзя.
  unavailableReason?: string | null
  selected: boolean
}) => {
  const disabled = Boolean(unavailableReason)

  return (
    <RadioGroupOption
      value={value}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-1 py-4 border rounded-rounded px-8 mb-2",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive": selected,
        }
      )}
      data-testid={`payment-method-${value}`}
    >
      <div className="flex items-center justify-between gap-x-4">
        <div className="flex items-center gap-x-4">
          <Radio checked={selected} />
          <Text className="text-base-regular">{title}</Text>
        </div>
        {icon && (
          <span className="justify-self-end text-ui-fg-base">{icon}</span>
        )}
      </div>
      <Text className="txt-small text-ui-fg-subtle pl-9">{description}</Text>
      {note && <Text className="txt-small text-ui-fg-subtle pl-9">{note}</Text>}
      {unavailableReason && (
        <Text
          className="txt-small text-ui-fg-error pl-9"
          data-testid="payment-method-unavailable"
        >
          {unavailableReason}
        </Text>
      )}
    </RadioGroupOption>
  )
}

export default PaymentMethodOption
