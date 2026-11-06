"use client"

import {
  AssistantDeliveryForm,
  saveAssistantCustomerProfile,
} from "@lib/data/assistant"
import { useMessages } from "@lib/i18n/i18n-context"
import { MapPoint } from "@lib/maps/dgis"
import AddressMapPicker from "@modules/common/components/address-map-picker"
import PhoneInput from "@modules/common/components/phone-input"
import { useState } from "react"

type Field = "first_name" | "last_name" | "address_1" | "phone"

// Порядок полей формы. Показываем только то, чего ассистенту не хватает
// (`missing_fields`), — уже известное покупатель не вводит второй раз.
const FIELDS: Field[] = ["first_name", "last_name", "address_1", "phone"]

const INPUT_CLASS =
  "h-11 rounded-chip border border-line bg-surface-dim px-3 text-body-medium text-ink placeholder:text-ink-secondary focus:border-accent focus:outline-none"

// Мини-форма доставки в ленте чата (вставка delivery_form). Сохраняет профиль
// напрямую и отправляет ассистенту реплику с данными — он продолжит
// оформление, не переспрашивая. Ответить текстом в чат можно и без формы.
const DeliveryFormAttachment = ({
  attachment,
  onSaved,
}: {
  attachment: AssistantDeliveryForm
  onSaved?: (message: string) => void
}) => {
  const m = useMessages()
  const t = m.assistant.deliveryForm
  const labels: Record<Field, string> = {
    first_name: t.firstName,
    last_name: t.lastName,
    address_1: t.address,
    phone: t.phone,
  }

  const missing = FIELDS.filter((field) =>
    attachment.missing_fields.includes(field)
  )
  const [values, setValues] = useState<Record<Field, string>>({
    first_name: attachment.first_name ?? "",
    last_name: attachment.last_name ?? "",
    address_1: attachment.address_1 ?? "",
    phone: attachment.phone ?? "",
  })
  // Точка с карты: уходит вместе с адресом, чтобы водитель приехал к дому.
  const [geo, setGeo] = useState<MapPoint | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!missing.length) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const empty = missing.filter((field) => !values[field].trim())
    if (empty.length) {
      setError(
        t.required.replace("{fields}", empty.map((f) => labels[f]).join(", "))
      )
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await saveAssistantCustomerProfile({
        ...Object.fromEntries(
          missing.map((field) => [field, values[field].trim()])
        ),
        ...(geo && missing.includes("address_1")
          ? { lat: geo.lat, lng: geo.lng }
          : {}),
      })
      setIsSaved(true)
      const name = [values.first_name, values.last_name]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ")
      onSaved?.(
        t.reply
          .replace("{name}", name)
          .replace("{address}", values.address_1.trim())
      )
    } catch {
      setError(t.failed)
    } finally {
      setIsSaving(false)
    }
  }

  if (isSaved) {
    return (
      <div
        className="rounded-card border border-line bg-surface p-4 text-body-medium text-success"
        data-testid="assistant-delivery-form-saved"
      >
        {t.saved}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="assistant-delivery-form"
    >
      <div className="flex flex-col gap-1">
        <span className="text-title-medium text-ink">{t.title}</span>
        <span className="text-body-medium text-ink-secondary">
          {t.description}
        </span>
      </div>

      {missing.includes("address_1") && (
        <AddressMapPicker
          onPick={(picked) => {
            setGeo({ lat: picked.lat, lng: picked.lng })
            setValues((current) => ({
              ...current,
              address_1: picked.address_1,
            }))
          }}
          onPoint={setGeo}
        />
      )}

      {missing.map((field) =>
        field === "phone" ? (
          <PhoneInput
            key={field}
            label={labels.phone}
            value={values.phone}
            onChange={(phone) =>
              setValues((current) => ({ ...current, phone }))
            }
            required
            disabled={isSaving}
            data-testid="assistant-delivery-form-phone"
          />
        ) : (
          <label key={field} className="flex flex-col gap-1">
            <span className="text-body-medium text-ink-secondary">
              {labels[field]}
            </span>
            <input
              className={INPUT_CLASS}
              value={values[field]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
              autoComplete={
                field === "first_name"
                  ? "given-name"
                  : field === "last_name"
                  ? "family-name"
                  : "street-address"
              }
              disabled={isSaving}
              data-testid={`assistant-delivery-form-${field}`}
            />
            {field === "address_1" && (
              <span className="text-body-medium text-ink-secondary">
                {t.addressHint}
              </span>
            )}
          </label>
        )
      )}

      {error && (
        <p className="text-body-medium text-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex min-h-[48px] items-center justify-center rounded-chip bg-accent px-4 py-2 text-body-large text-on-accent transition-colors hover:bg-accent-pressed disabled:opacity-60"
        data-testid="assistant-delivery-form-submit"
      >
        {isSaving ? t.saving : t.save}
      </button>
    </form>
  )
}

export default DeliveryFormAttachment
