import { toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminPriceStockImportResponse,
  PriceStockFileError,
  PriceStockFileErrorCode,
  priceStockExportFileName,
} from "../lib/price-stock-import"

// Обмен файлом на экране «Цены и остатки» (T10.14c): выгрузка среза и
// предпросмотр загруженного файла. Записи здесь нет — партию применяет
// `usePriceStockApply`, тот же путь, что и у правки в клетке.

export type PriceStockSliceParams = {
  q?: string
  category?: string | null
  stock?: string | null
  location_id?: string | null
}

const sliceQuery = (params: PriceStockSliceParams): string => {
  const query = new URLSearchParams()
  if (params.q) {
    query.set("q", params.q)
  }
  if (params.category) {
    query.set("category", params.category)
  }
  if (params.stock) {
    query.set("stock", params.stock)
  }
  if (params.location_id) {
    query.set("location_id", params.location_id)
  }
  const text = query.toString()
  return text ? `?${text}` : ""
}

// Байты файла → base64 кусками: одна строка на весь файл через spread кладёт
// стек на выгрузке в тысячу позиций.
const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  let binary = ""
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    binary += String.fromCharCode(
      ...Array.from(bytes.subarray(offset, offset + chunk))
    )
  }
  return btoa(binary)
}

const isFileErrorCode = (value: unknown): value is PriceStockFileErrorCode =>
  typeof value === "string"

// Почему голый fetch, а не sdk.client.fetch (та же причина, что у записи
// партии): выгрузка — это файл, а не JSON, а от 400-го предпросмотра js-sdk
// оставляет одно `message` и теряет `file_error`, по которому экран объясняет,
// что чинить в файле. Адрес относительный, авторизация — сессионной cookie.
const requestPreview = async (input: {
  file: File
  locationId: string | null
}): Promise<AdminPriceStockImportResponse> => {
  const response = await fetch("/admin/price-stock/import", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_name: input.file.name,
      content_base64: toBase64(await input.file.arrayBuffer()),
      ...(input.locationId ? { location_id: input.locationId } : {}),
    }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const failure: PriceStockFileError = {
      message: String(body?.message ?? response.statusText),
      code: isFileErrorCode(body?.file_error) ? body.file_error : null,
    }
    throw failure
  }
  return body as AdminPriceStockImportResponse
}

const isFileError = (error: unknown): error is PriceStockFileError =>
  typeof error === "object" && error !== null && "code" in error

export const usePriceStockExchange = () => {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<AdminPriceStockImportResponse | null>(
    null
  )
  const [fileError, setFileError] = useState<PriceStockFileError | null>(null)
  const [exporting, setExporting] = useState(false)

  // Выгрузка идёт файлом: тянем CSV с авторизацией и отдаём его браузеру
  // ссылкой (идиома экспорта для 1С в карточке заказа).
  const exportSlice = async (params: PriceStockSliceParams) => {
    setExporting(true)
    try {
      const response = await fetch(
        `/admin/price-stock/export${sliceQuery(params)}`,
        { credentials: "include" }
      )
      if (!response.ok) {
        throw new Error(t("priceStock.exchange.exportFailed"))
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = priceStockExportFileName(new Date())
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setExporting(false)
    }
  }

  const previewMutation = useMutation({
    mutationFn: requestPreview,
    onMutate: () => setFileError(null),
    onSuccess: (response) => setPreview(response),
    onError: (error: unknown) => {
      if (isFileError(error)) {
        setFileError(error)
        toast.error(error.message)
        return
      }
      toast.error(error instanceof Error ? error.message : String(error))
    },
  })

  return {
    exportSlice,
    exporting,
    previewMutation,
    preview,
    fileError,
    closePreview: () => {
      setPreview(null)
      setFileError(null)
    },
  }
}
