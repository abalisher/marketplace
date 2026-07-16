import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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

// Мутация перехода жизненного цикла заказа (POST /admin/orders/:id/lifecycle/*).
// Общая для виджета на странице заказа; инвалидирует наш статус и ядровый заказ
// (у ядра корень queryKey — "orders"), чтобы обновились и виджет, и страница.
export const useOrderLifecycle = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["order-lifecycle"] })
    queryClient.invalidateQueries({ queryKey: ["orders"] })
  }

  const transitionMutation = useMutation({
    mutationFn: ({ orderId, transition, body }: TransitionVars) =>
      sdk.client.fetch<TransitionResponse>(
        `/admin/orders/${orderId}/lifecycle/${transition.path}`,
        { method: "POST", body: body ?? {} }
      ),
    onSuccess: (_data, { transition }) => {
      toast.success(transition.success)
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { transitionMutation }
}
