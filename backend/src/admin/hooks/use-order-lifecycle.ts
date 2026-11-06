import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { sdk } from "../lib/sdk"
import { OrderTransition } from "../lib/order"

// Тело перехода: complete-assembly/ship требуют позиции, ship/deliver —
// fulfillment, deliver при доставке — код получения от покупателя.
// Строится вызывающим (виджет) из данных ядровой страницы заказа.
type TransitionBody = {
  items?: { id: string; quantity: number }[]
  fulfillment_id?: string
  reason?: string | null
  delivery_code?: string
  // Подтверждение заказа «в долг» — срок возврата `YYYY-MM-DD`.
  debt_due_date?: string
}

type TransitionVars = {
  orderId: string
  transition: OrderTransition
  body?: TransitionBody
}

type TransitionResponse = {
  order_id: string
  status?: string
}

// Перенос доставки (T5.6b): новый слот + обязательная причина. Не переход —
// статус заказа не меняется, поэтому у мутации своё тело и свой адрес.
type RescheduleVars = {
  orderId: string
  slot: { date: string; window: string }
  reason: string
}

// Мутация перехода жизненного цикла заказа (POST /admin/orders/:id/lifecycle/*).
// Общая для виджета на странице заказа; инвалидирует наш статус и ядровый заказ
// (у ядра корень queryKey — "orders"), чтобы обновились и виджет, и страница.
export const useOrderLifecycle = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Промис возвращается намеренно: react-query держит мутацию в isPending до
  // конца инвалидации, и кнопка действия в строке очереди не даёт второй клик
  // по ещё не обновившейся строке (окно между успехом и refetch).
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["order-lifecycle"] }),
      queryClient.invalidateQueries({ queryKey: ["orders"] }),
      // Очередь отгрузки (T10.13) читает те же заказы: переход из любого места
      // панели должен убрать отгруженный заказ с её экрана.
      queryClient.invalidateQueries({ queryKey: ["shipping-queue"] }),
    ])

  const transitionMutation = useMutation({
    mutationFn: ({ orderId, transition, body }: TransitionVars) =>
      sdk.client.fetch<TransitionResponse>(
        `/admin/orders/${orderId}/lifecycle/${transition.path}`,
        { method: "POST", body: body ?? {} }
      ),
    onSuccess: (_data, { transition }) => {
      toast.success(t(transition.success))
      return invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const rescheduleMutation = useMutation({
    mutationFn: ({ orderId, slot, reason }: RescheduleVars) =>
      sdk.client.fetch<{ order_id: string }>(
        `/admin/orders/${orderId}/lifecycle/reschedule`,
        {
          method: "POST",
          body: {
            slot_date: slot.date,
            slot_window: slot.window,
            reason,
          },
        }
      ),
    onSuccess: () => {
      toast.success(t("order.reschedule.toast"))
      return invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { transitionMutation, rescheduleMutation }
}
