import { Label, Prompt, Select, Text, Textarea } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDeliverySlot } from "../lib/delivery-slot"
import { AdminOrderRescheduleOptionsResponse } from "../lib/order"
import { sdk } from "../lib/sdk"

type RescheduleDeliveryPromptProps = {
  // null — диалог закрыт
  order: { id: string; display_id?: number } | null
  onClose: () => void
  onSubmit: (
    id: string,
    slot: { date: string; window: string },
    reason: string
  ) => void
  isPending: boolean
}

// Значение Select — одна строка: дата и окно неразделимы (в четверг может быть
// свободно только утро), поэтому выбирается ГОТОВЫЙ слот из списка бэкенда, а
// не дата и окно по отдельности.
const SEPARATOR = "|"

// Диалог переноса доставки (T5.6b): продавец двигает окно приезда по звонку
// покупателя («объект не готов, привезите в четверг утром»). Причина
// ОБЯЗАТЕЛЬНА — лог заказа должен отвечать, кто и почему подвинул доставку.
//
// Список окон приходит с бэкенда (GET .../lifecycle/reschedule) и уже учитывает
// запас на сборку и горизонт недели: панель не решает, какое окно ещё можно
// пообещать — иначе продавец поставил бы слот, которого покупателю в чате уже
// не предлагают.
const RescheduleDeliveryPrompt = ({
  order,
  onClose,
  onSubmit,
  isPending,
}: RescheduleDeliveryPromptProps) => {
  const { t } = useTranslation()
  const [slot, setSlot] = useState("")
  const [reason, setReason] = useState("")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order-lifecycle", "reschedule", order?.id],
    queryFn: () =>
      sdk.client.fetch<AdminOrderRescheduleOptionsResponse>(
        `/admin/orders/${order?.id}/lifecycle/reschedule`
      ),
    enabled: !!order,
  })

  useEffect(() => {
    setSlot("")
    setReason("")
  }, [order?.id])

  const current = data?.current
  // Текущее окно из списка убираем: «перенос на то же самое» бэкенд отклонит,
  // и предлагать его в списке — приглашение к ошибке.
  const slots = (data?.slots ?? []).filter(
    (option) =>
      !(option.date === current?.date && option.window === current?.window)
  )
  const canReschedule = data?.can_reschedule ?? false
  // Заказу, оформленному до T5.6, окно не переносят, а НАЗНАЧАЮТ: «покупатель
  // ждёт машину в текущее» про него было бы неправдой — текущего нет.
  const assigning = !!data && !current?.date
  const submittable = canReschedule && !!slot && !!reason.trim()

  return (
    <Prompt
      open={!!order}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      // Перенос не разрушает заказ — вариант «подтверждение», а не danger:
      // красная кнопка (дефолт Prompt) читалась бы как отмена доставки.
      variant="confirmation"
    >
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>
            {t(
              assigning ? "order.reschedule.assignTitle" : "order.reschedule.title"
            )}
          </Prompt.Title>
          <Prompt.Description>
            {order
              ? order.display_id
                ? t(
                    assigning
                      ? "order.reschedule.assignDescNamed"
                      : "order.reschedule.descNamed",
                    { id: order.display_id }
                  )
                : t(
                    assigning
                      ? "order.reschedule.assignDescGeneric"
                      : "order.reschedule.descGeneric"
                  )
              : ""}
          </Prompt.Description>
        </Prompt.Header>
        <div className="flex flex-col gap-y-4 px-6 py-4">
          {/* Текущее окно — над выбором: продавец переносит «с четверга дня»,
              и без него он двигает доставку по памяти. Нет окна (заказ до
              T5.6) или нет ответа (загрузка, ошибка) — строки нет: прочерк
              вместо окна ничего не сообщает, а на ошибке ещё и врёт. */}
          {current?.date && (
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                {t("order.reschedule.currentLabel")}
              </Text>
              <Text size="small">
                {formatDeliverySlot(current?.date, current?.window)}
              </Text>
            </div>
          )}

          {isError ? (
            <Text size="small" className="text-ui-fg-subtle">
              {t("order.reschedule.loadError")}
            </Text>
          ) : isLoading ? (
            <Text size="small" className="text-ui-fg-subtle">
              {t("common.loading")}
            </Text>
          ) : !canReschedule ? (
            <Text size="small" className="text-ui-fg-subtle">
              {t("order.reschedule.notAllowed")}
            </Text>
          ) : !slots.length ? (
            <Text size="small" className="text-ui-fg-subtle">
              {t("order.reschedule.noSlots")}
            </Text>
          ) : (
            <>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="reschedule-slot">
                  {t("order.reschedule.slotLabel")}
                </Label>
                <Select value={slot} onValueChange={setSlot}>
                  <Select.Trigger id="reschedule-slot">
                    <Select.Value
                      placeholder={t("order.reschedule.slotPlaceholder")}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {slots.map((option) => {
                      const value = `${option.date}${SEPARATOR}${option.window}`
                      return (
                        <Select.Item key={value} value={value}>
                          {formatDeliverySlot(option.date, option.window)}
                        </Select.Item>
                      )
                    })}
                  </Select.Content>
                </Select>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="reschedule-reason">
                  {t("order.reschedule.reasonLabel")}
                </Label>
                <Textarea
                  id="reschedule-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("order.reschedule.reasonPlaceholder")}
                />
              </div>
              {/* Уведомления покупателю пока нет (notification-провайдер не
                  подключён) — продавец обязан знать, что о новом окне
                  предупреждает он сам. */}
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("order.reschedule.notifyHint")}
              </Text>
            </>
          )}
        </div>
        <Prompt.Footer>
          <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
          <Prompt.Action
            disabled={isPending || !submittable}
            onClick={() => {
              const [date, window] = slot.split(SEPARATOR)
              if (!order || !date || !window) {
                return
              }
              onSubmit(order.id, { date, window }, reason.trim())
            }}
          >
            {t(
              assigning
                ? "order.reschedule.assignConfirm"
                : "order.reschedule.confirm"
            )}
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

export default RescheduleDeliveryPrompt
