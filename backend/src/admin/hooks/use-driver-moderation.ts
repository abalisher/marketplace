import { toast, usePrompt } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { AdminDriver, AdminDriverResponse } from "../lib/driver"
import { formatPhone } from "../lib/phone"
import { sdk } from "../lib/sdk"

// Решения продавца по водителю: допустить к заказам (с подтверждением) и
// закрыть доступ (с причиной). Общие для очереди заявок и карточки водителя.
// Отказ по заявке и блокировка — ОДИН переход `blocked`: различает их причина,
// поэтому мутация одна.
export const useDriverModeration = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const confirmDialog = usePrompt()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-drivers"] })

  const setStatus = (id: string, status: "active" | "blocked", note?: string) =>
    sdk.client.fetch<AdminDriverResponse>(`/admin/drivers/${id}/status`, {
      method: "POST",
      body: { status, ...(note ? { note } : {}) },
    })

  const activateMutation = useMutation({
    mutationFn: (id: string) => setStatus(id, "active"),
    onSuccess: () => {
      toast.success(t("drivers.toast.activated"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      setStatus(id, "blocked", reason),
    onSuccess: () => {
      toast.success(t("drivers.toast.blocked"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Допуск открывает водителю чужой товар и чужие деньги — спрашиваем,
  // называя человека и его машину.
  const activateWithConfirm = async (driver: AdminDriver) => {
    const confirmed = await confirmDialog({
      title: t("drivers.activate.title"),
      description: t("drivers.activate.description", {
        // Профиль без ФИО сюда не попадает (сервер такую заявку не допустит),
        // но подстраховываемся номером — читаемым, а не каноном.
        name: driver.full_name?.trim() || formatPhone(driver.phone),
      }),
      confirmText: t("drivers.action.activate"),
      cancelText: t("common.cancel"),
      variant: "confirmation",
    })
    if (confirmed) {
      activateMutation.mutate(driver.id)
    }
  }

  return { activateMutation, blockMutation, activateWithConfirm }
}
