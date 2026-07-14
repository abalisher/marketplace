import { toast, usePrompt } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminCompanyResponse } from "../lib/company"
import { sdk } from "../lib/sdk"

// Мутации модерации компании (approve с подтверждением, reject с причиной).
// Общие для списка (действия строки) и карточки.
export const useCompanyModeration = () => {
  const queryClient = useQueryClient()
  const confirmDialog = usePrompt()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-companies"] })

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch<AdminCompanyResponse>(`/admin/companies/${id}/approve`, {
        method: "POST",
      }),
    onSuccess: () => {
      toast.success("Company approved")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      sdk.client.fetch<AdminCompanyResponse>(`/admin/companies/${id}/reject`, {
        method: "POST",
        body: { reason },
      }),
    onSuccess: () => {
      toast.success("Company rejected")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const approveWithConfirm = async (company: { id: string; name: string }) => {
    const confirmed = await confirmDialog({
      title: "Approve company?",
      description: `The company "${company.name}" will be activated: its employees will be able to place orders within their spend limits.`,
      confirmText: "Approve",
      cancelText: "Cancel",
      variant: "confirmation",
    })
    if (confirmed) {
      approveMutation.mutate(company.id)
    }
  }

  return { approveMutation, rejectMutation, approveWithConfirm }
}
