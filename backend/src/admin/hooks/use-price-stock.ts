import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminPriceStockApplyResponse,
  AdminPriceStockChange,
  AdminPriceStockIssue,
} from "../lib/price-stock"

// Отказ партии: ресурс отвечает 400 и списком проблемных позиций (код +
// название). Он же — состояние экрана: строки остаются набранными, а под
// таблицей продавец видит, какая позиция помешала.
export type PriceStockFailure = {
  message: string
  issues: AdminPriceStockIssue[]
}

// Партия и её происхождение. Источник уходит в журнал правок: «импорт» рядом с
// записью объясняет, откуда взялась цена, которую никто руками не набирал.
export type PriceStockApplyInput = {
  changes: AdminPriceStockChange[]
  source: "manual" | "import"
}

// Почему тут голый fetch, а не sdk.client.fetch: js-sdk на не-2xx бросает
// FetchError, оставляя от тела ответа ОДНО поле message — список `issues`
// теряется по дороге. А он и есть смысл ответа: в массовой правке продавец
// обязан видеть, какая из двадцати позиций не прошла. Адрес относительный —
// админку отдаёт сам бэкенд, авторизация идёт сессионной cookie (та же, что у
// sdk: см. lib/sdk.ts).
const applyChanges = async ({
  changes,
  source,
}: PriceStockApplyInput): Promise<AdminPriceStockApplyResponse> => {
  const response = await fetch("/admin/price-stock", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes, source }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const failure: PriceStockFailure = {
      message: String(body?.message ?? response.statusText),
      issues: Array.isArray(body?.issues) ? body.issues : [],
    }
    throw failure
  }
  return body as AdminPriceStockApplyResponse
}

const isFailure = (error: unknown): error is PriceStockFailure =>
  typeof error === "object" && error !== null && "issues" in error

// Запись правок цены и остатка. Партия применяется целиком либо не применяется
// вовсе, поэтому у экрана два исхода и оба видны: тост «записано N» либо разбор
// отказа под таблицей.
export const usePriceStockApply = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [failure, setFailure] = useState<PriceStockFailure | null>(null)

  const applyMutation = useMutation({
    mutationFn: applyChanges,
    onMutate: () => setFailure(null),
    onSuccess: (response) => {
      if (response.applied) {
        toast.success(t("priceStock.toast.applied", { n: response.applied }))
      } else {
        // Все правки совпали с текущими числами: ресурс их вычеркнул, и
        // молчать нельзя — иначе кажется, что кнопка не сработала.
        toast.info(t("priceStock.toast.nothingChanged"))
      }
      queryClient.invalidateQueries({ queryKey: ["price-stock"] })
    },
    onError: (error: unknown) => {
      if (isFailure(error)) {
        setFailure(error)
        toast.error(error.message)
        return
      }
      toast.error(error instanceof Error ? error.message : String(error))
    },
  })

  return { applyMutation, failure, clearFailure: () => setFailure(null) }
}
