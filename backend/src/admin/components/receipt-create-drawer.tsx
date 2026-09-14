import { DocumentText, Plus, Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  DatePicker,
  Drawer,
  IconButton,
  Input,
  Label,
  Popover,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminParseInvoiceResponse,
  AdminReceiptResponse,
  AdminSuppliersResponse,
  ReceiptSource,
} from "../lib/procurement"
import { formatTenge } from "../lib/money"
import { sdk } from "../lib/sdk"

type ReceiptCreateDrawerProps = {
  open: boolean
  onClose: () => void
  // Открыть карточку прихода (после неудачной проводки — тот самый черновик).
  onOpenReceipt?: (receiptId: string) => void
}

// Строка формы (клиентская). variant_id пустой = позиция ещё не сопоставлена с SKU
// (пришла из ИИ-распознавания накладной) — продавец сопоставляет её перед проводкой;
// recognizedTitle хранит текст, распознанный ИИ, до сопоставления. quantity/unit_cost
// — строки (свободный ввод, парсинг при сохранении).
type LineForm = {
  key: string
  variant_id: string
  title: string
  sku: string | null
  recognizedTitle: string
  quantity: string
  unit: string
  unit_cost: string
  expires_at: Date | null
}

type VariantPick = { variant_id: string; title: string; sku: string | null }

// Ответ ядрового поиска товаров (усечён до нужных полей).
type ProductSearchResponse = {
  products: {
    id: string
    title: string
    variants:
      | { id: string; title: string | null; sku: string | null }[]
      | null
  }[]
}

type LocationsResponse = { stock_locations: { id: string; name: string }[] }

const DEFAULT_UNIT = "шт"
const ALLOWED_INVOICE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
// Тот же предел, что у роута (MAX_INVOICE_BYTES в src/lib/invoice-ai.ts).
// Проверяем ДО чтения файла: иначе крупный снимок уходит на сервер и
// возвращается голым 413 без объяснения, что не так.
const MAX_INVOICE_BYTES = 8 * 1024 * 1024

let lineSeq = 0
const nextKey = () => `line-${lineSeq++}`

// Файл → base64 (без data-URL префикса) для отправки в parse-invoice.
const readAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1] ?? "")
    }
    reader.onerror = () => reject(new Error("read failed"))
    reader.readAsDataURL(file)
  })

// Drawer «Новый приход» (seller-first форма подзадачи 1c + ИИ-приёмка 2): поставщик
// → строки (со SKU из каталога ЛИБО распознанные из накладной ИИ) → «Сохранить
// черновик» либо «Сохранить и провести». ИИ-путь: загрузить накладную → строки
// префиллятся (variant_id пустой) → продавец сопоставляет каждую с товаром → проводит.
// Проводка требует сопоставления всех строк (проверяет и модуль). Идиома
// material-norm-drawer + флоу order-lifecycle.
const ReceiptCreateDrawer = ({
  open,
  onClose,
  onOpenReceipt,
}: ReceiptCreateDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [supplierId, setSupplierId] = useState<string>("")
  const [locationId, setLocationId] = useState<string>("")
  // Неудачная проводка: черновик уже сохранён, поэтому вместо повторного
  // создания (плодило дубли — находка Ф-прогона T4.6) показываем причину и
  // ведём в карточку черновика.
  const [postFailure, setPostFailure] = useState<{
    receiptId: string
    message: string
  } | null>(null)
  const [reference, setReference] = useState("")
  const [receivedAt, setReceivedAt] = useState<Date | null>(null)
  const [note, setNote] = useState("")
  const [source, setSource] = useState<ReceiptSource>("manual")
  const [lines, setLines] = useState<LineForm[]>([])
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  // Ключ строки, для которой открыт popover сопоставления SKU (null — закрыт).
  const [matchKey, setMatchKey] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSupplierId("")
      setLocationId("")
      setPostFailure(null)
      setReference("")
      setReceivedAt(null)
      setNote("")
      setSource("manual")
      setLines([])
      setSearch("")
      setAddOpen(false)
      setMatchKey(null)
    }
  }, [open])

  // Активные поставщики для подбора (деактивированные не мусорят).
  const { data: suppliersData } = useQuery({
    queryKey: ["procurement-suppliers", "active"],
    queryFn: () =>
      sdk.client.fetch<AdminSuppliersResponse>(
        "/admin/procurement/suppliers",
        { query: { active: "true" } }
      ),
    enabled: open,
  })
  const suppliers = suppliersData?.suppliers ?? []

  // Склад приёмки выбирает человек. Раньше брали ПЕРВЫЙ склад из списка —
  // и приход уходил на «European Warehouse» из демо-сида, где у наших позиций
  // нет учёта; проводка падала (Ф-прогон T4.6, блокер закупщика). Единственный
  // склад подставляем сам — выбирать не из чего.
  const { data: locationsData } = useQuery({
    queryKey: ["stock-locations", "for-procurement"],
    queryFn: () =>
      sdk.client.fetch<LocationsResponse>("/admin/stock-locations", {
        query: { limit: 20 },
      }),
    enabled: open,
  })
  const locations = locationsData?.stock_locations ?? []

  useEffect(() => {
    if (locations.length === 1 && !locationId) {
      setLocationId(locations[0].id)
    }
  }, [locations, locationId])

  const pickerActive = addOpen || matchKey !== null

  // Поиск товаров каталога по названию/SKU (общий для добавления и сопоставления).
  const { data: searchData, isFetching: isSearching } = useQuery({
    queryKey: ["procurement-variant-search", search],
    queryFn: () =>
      sdk.client.fetch<ProductSearchResponse>("/admin/products", {
        query: {
          q: search,
          limit: 10,
          fields: "id,title,variants.id,variants.title,variants.sku",
        },
      }),
    enabled: open && pickerActive && search.trim().length > 0,
  })

  // Плоский список вариантов из найденных товаров.
  const variantResults = useMemo<VariantPick[]>(() => {
    const products = searchData?.products ?? []
    return products.flatMap((p) =>
      (p.variants ?? []).map((v) => ({
        variant_id: v.id,
        title: v.title ? `${p.title} · ${v.title}` : p.title,
        sku: v.sku,
      }))
    )
  }, [searchData])

  const addLine = (variant: VariantPick) => {
    setLines((prev) => [
      ...prev,
      {
        key: nextKey(),
        variant_id: variant.variant_id,
        title: variant.title,
        sku: variant.sku,
        recognizedTitle: "",
        quantity: "",
        unit: DEFAULT_UNIT,
        unit_cost: "",
        expires_at: null,
      },
    ])
    setAddOpen(false)
    setSearch("")
  }

  // Сопоставить распознанную (или любую) строку с товаром каталога.
  const matchLine = (key: string, variant: VariantPick) => {
    updateLine(key, {
      variant_id: variant.variant_id,
      title: variant.title,
      sku: variant.sku,
    })
    setMatchKey(null)
    setSearch("")
  }

  const updateLine = (key: string, patch: Partial<LineForm>) =>
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l))
    )

  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key))

  const total = lines.reduce((sum, l) => {
    const qty = Number(l.quantity)
    const cost = Number(l.unit_cost)
    return (
      sum +
      (Number.isFinite(qty) && Number.isFinite(cost)
        ? Math.round(Math.max(0, qty) * Math.max(0, cost))
        : 0)
    )
  }, 0)

  // Черновик можно сохранить и без сопоставления (ИИ-строки), проводка — только
  // если все строки сопоставлены с SKU (иначе модуль отклонит).
  const lineValuesOk = (l: LineForm) => {
    const qty = Number(l.quantity)
    const cost = Number(l.unit_cost)
    return (
      l.unit.trim() !== "" &&
      Number.isFinite(qty) &&
      qty > 0 &&
      Number.isFinite(cost) &&
      cost >= 0
    )
  }
  // Склад обязателен: без него непонятно, куда лёг товар. Пока приход не
  // сохранён — кнопки живут; после неудачной проводки черновик уже есть, и
  // повторно создавать его нельзя (дубли).
  const canSaveDraft =
    lines.length > 0 &&
    lines.every(lineValuesOk) &&
    locationId !== "" &&
    postFailure === null
  const canPost = canSaveDraft && lines.every((l) => l.variant_id !== "")

  // Почему кнопки выключены — говорим прямо. Выключенная кнопка без объяснения
  // читается как поломка (замечание владельца 2026-08-12: «что-то с кнопкой»).
  const blockedReason = (): string | null => {
    if (postFailure) {
      return null
    }
    if (locationId === "") {
      return t("procurement.create.blockedNoLocation")
    }
    if (lines.length === 0) {
      return t("procurement.create.blockedNoLines")
    }
    if (!lines.every(lineValuesOk)) {
      return t("procurement.create.blockedBadValues")
    }
    const unmatchedCount = lines.filter((l) => l.variant_id === "").length
    if (unmatchedCount > 0) {
      return t("procurement.create.blockedUnmatched", { count: unmatchedCount })
    }
    return null
  }
  const blocked = blockedReason()

  const buildBody = () => ({
    location_id: locationId,
    supplier_id: supplierId || null,
    reference: reference.trim() ? reference.trim() : null,
    note: note.trim() ? note.trim() : null,
    source,
    received_at: receivedAt ? receivedAt.toISOString() : null,
    lines: lines.map((l) => ({
      variant_id: l.variant_id || null,
      // Читаемый заголовок строки: сопоставленный — название товара·вариант;
      // несопоставленный (ИИ-черновик) — распознанный ИИ текст.
      recognized_title: l.variant_id ? l.title : l.recognizedTitle,
      quantity: Number(l.quantity),
      unit: l.unit.trim(),
      unit_cost: Number(l.unit_cost),
      expires_at: l.expires_at ? l.expires_at.toISOString() : null,
    })),
  })

  const finish = () => {
    queryClient.invalidateQueries({ queryKey: ["procurement-receipts"] })
    onClose()
  }

  // ИИ-приёмка: файл накладной → распознанные позиции → префилл строк (без
  // сопоставления). Нечитаемый ввод/ошибка ИИ → toast, ручной ввод остаётся.
  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_INVOICE_TYPES.includes(file.type)) {
        throw new Error(t("procurement.errors.unsupportedFile"))
      }
      if (file.size > MAX_INVOICE_BYTES) {
        throw new Error(
          t("procurement.errors.fileTooLarge", {
            limit: MAX_INVOICE_BYTES / (1024 * 1024),
          })
        )
      }
      const data = await readAsBase64(file)
      return sdk.client.fetch<AdminParseInvoiceResponse>(
        "/admin/procurement/parse-invoice",
        { method: "POST", body: { mime_type: file.type, data } }
      )
    },
    onSuccess: ({ recognized, supplier }) => {
      setSource("invoice_ai")
      // Поставщика из накладной бэкенд нашёл или завёл сам — подставляем и
      // обновляем список, чтобы он был выбран в селекте.
      if (supplier) {
        void queryClient.invalidateQueries({
          queryKey: ["procurement-suppliers"],
        })
        setSupplierId(supplier.id)
        if (supplier.created) {
          toast.success(
            t("procurement.toast.supplierCreated", { name: supplier.name })
          )
        }
      }
      if (recognized.reference && !reference.trim()) {
        setReference(recognized.reference)
      }
      if (recognized.received_at && !receivedAt) {
        const d = new Date(recognized.received_at)
        if (!Number.isNaN(d.getTime())) {
          setReceivedAt(d)
        }
      }
      setLines((prev) => [
        ...prev,
        ...recognized.lines.map((rl) => ({
          key: nextKey(),
          variant_id: "",
          title: "",
          sku: null,
          recognizedTitle: rl.recognized_title,
          quantity: String(rl.quantity),
          unit: rl.unit || DEFAULT_UNIT,
          unit_cost: String(rl.unit_cost),
          expires_at: null,
        })),
      ])
      toast.success(
        t("procurement.toast.parsed", { count: recognized.lines.length })
      )
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Сброс значения — чтобы повторный выбор того же файла триггерил change.
    e.target.value = ""
    if (file) {
      parseMutation.mutate(file)
    }
  }

  const saveDraftMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<AdminReceiptResponse>("/admin/procurement/receipts", {
        method: "POST",
        body: buildBody(),
      }),
    onSuccess: () => {
      toast.success(t("procurement.toast.draftCreated"))
      finish()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // «Сохранить и провести» = создать черновик + провести. Если проводка упала,
  // черновик остаётся сохранённым: показываем причину в форме (а не растворяющимся
  // тостом) и ведём в карточку черновика — второй раз создавать нельзя, иначе
  // повисают дубли на ту же сумму (находка Ф-прогона T4.6).
  const saveAndPostMutation = useMutation({
    mutationFn: async () => {
      const { receipt } = await sdk.client.fetch<AdminReceiptResponse>(
        "/admin/procurement/receipts",
        { method: "POST", body: buildBody() }
      )
      try {
        return await sdk.client.fetch<AdminReceiptResponse>(
          `/admin/procurement/receipts/${receipt.id}/post`,
          { method: "POST" }
        )
      } catch (error) {
        setPostFailure({
          receiptId: receipt.id,
          message: error instanceof Error ? error.message : String(error),
        })
        // Черновик уже в списке — обновляем его, чтобы приход не «потерялся».
        queryClient.invalidateQueries({ queryKey: ["procurement-receipts"] })
        throw error
      }
    },
    onSuccess: () => {
      toast.success(t("procurement.toast.posted"))
      finish()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const isBusy =
    saveDraftMutation.isPending ||
    saveAndPostMutation.isPending ||
    parseMutation.isPending

  const guardLocation = (run: () => void) => {
    if (!locationId) {
      toast.error(t("procurement.errors.noLocation"))
      return
    }
    run()
  }

  const openFailedDraft = () => {
    if (postFailure && onOpenReceipt) {
      const receiptId = postFailure.receiptId
      onClose()
      onOpenReceipt(receiptId)
    }
  }

  // Список результатов поиска (общий для popover добавления и сопоставления).
  const renderResults = (onPick: (v: VariantPick) => void) =>
    search.trim() === "" ? null : isSearching ? (
      <Text size="small" className="text-ui-fg-subtle px-2 py-1.5">
        {t("common.loading")}
      </Text>
    ) : variantResults.length === 0 ? (
      <Text size="small" className="text-ui-fg-subtle px-2 py-1.5">
        {t("procurement.create.searchEmpty")}
      </Text>
    ) : (
      variantResults.map((v) => (
        <button
          key={v.variant_id}
          type="button"
          onClick={() => onPick(v)}
          className="hover:bg-ui-bg-base-hover flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left"
        >
          <Text size="small" className="text-ui-fg-base">
            {v.title}
          </Text>
          {v.sku && (
            <Text size="xsmall" className="text-ui-fg-subtle">
              {v.sku}
            </Text>
          )}
        </button>
      ))
    )

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("procurement.create.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          {/* ИИ-приёмка: загрузка накладной */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_INVOICE_TYPES.join(",")}
            className="hidden"
            onChange={onPickFile}
          />
          <Button
            variant="secondary"
            size="small"
            className="self-start"
            isLoading={parseMutation.isPending}
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            <DocumentText />
            {t("procurement.create.uploadInvoice")}
          </Button>

          <div className="flex flex-col gap-y-2">
            <Label>{t("procurement.create.location")}</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <Select.Trigger>
                <Select.Value
                  placeholder={t("procurement.create.locationPlaceholder")}
                />
              </Select.Trigger>
              <Select.Content>
                {locations.map((l) => (
                  <Select.Item key={l.id} value={l.id}>
                    {l.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {locationId === "" && (
              <Text size="small" className="text-ui-fg-subtle">
                {t("procurement.create.locationHint")}
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>{t("procurement.create.supplier")}</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <Select.Trigger>
                <Select.Value
                  placeholder={t("procurement.create.supplierNone")}
                />
              </Select.Trigger>
              <Select.Content>
                {suppliers.map((s) => (
                  <Select.Item key={s.id} value={s.id}>
                    {s.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {suppliers.length === 0 && (
              <Text size="small" className="text-ui-fg-subtle">
                {t("procurement.create.supplierEmpty")}
              </Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-3">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="receipt-reference">
                {t("procurement.create.reference")}
              </Label>
              <Input
                id="receipt-reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>{t("procurement.create.receivedAt")}</Label>
              <DatePicker value={receivedAt} onChange={setReceivedAt} />
            </div>
          </div>

          {/* Позиции прихода */}
          <div className="flex items-center justify-between">
            <Label>{t("procurement.receipt.linesTitle")}</Label>
            <Popover open={addOpen} onOpenChange={setAddOpen}>
              <Popover.Trigger asChild>
                <Button size="small" variant="secondary">
                  <Plus />
                  {t("procurement.create.addProduct")}
                </Button>
              </Popover.Trigger>
              <Popover.Content
                align="end"
                sideOffset={8}
                className="w-[360px] p-2"
              >
                <Input
                  autoFocus
                  placeholder={t("procurement.create.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="mt-2 max-h-[240px] overflow-auto">
                  {renderResults(addLine)}
                </div>
              </Popover.Content>
            </Popover>
          </div>

          {source === "invoice_ai" && lines.some((l) => l.variant_id === "") && (
            <Text size="small" className="text-ui-fg-subtle">
              {t("procurement.create.aiHint")}
            </Text>
          )}

          {lines.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              {t("procurement.create.noLines")}
            </Text>
          ) : (
            <div className="flex flex-col gap-y-3">
              {lines.map((line) => {
                const qty = Number(line.quantity)
                const cost = Number(line.unit_cost)
                const lineCost =
                  Number.isFinite(qty) && Number.isFinite(cost)
                    ? Math.round(Math.max(0, qty) * Math.max(0, cost))
                    : 0
                const unmatched = line.variant_id === ""
                return (
                  <div
                    key={line.key}
                    className="border-ui-border-base flex flex-col gap-y-2 rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between gap-x-2">
                      <div className="flex flex-col gap-y-1">
                        {unmatched ? (
                          <>
                            <Text size="small" weight="plus">
                              {line.recognizedTitle}
                            </Text>
                            <div className="flex items-center gap-x-2">
                              <Badge size="2xsmall" color="orange">
                                {t("procurement.receipt.unmatched")}
                              </Badge>
                              <Popover
                                open={matchKey === line.key}
                                onOpenChange={(o) =>
                                  setMatchKey(o ? line.key : null)
                                }
                              >
                                <Popover.Trigger asChild>
                                  <button
                                    type="button"
                                    className="text-ui-fg-interactive text-xs"
                                  >
                                    {t("procurement.create.matchProduct")}
                                  </button>
                                </Popover.Trigger>
                                <Popover.Content
                                  align="start"
                                  sideOffset={8}
                                  className="w-[360px] p-2"
                                >
                                  <Input
                                    autoFocus
                                    placeholder={t(
                                      "procurement.create.searchPlaceholder"
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                  />
                                  <div className="mt-2 max-h-[240px] overflow-auto">
                                    {renderResults((v) =>
                                      matchLine(line.key, v)
                                    )}
                                  </div>
                                </Popover.Content>
                              </Popover>
                            </div>
                          </>
                        ) : (
                          <>
                            <Text size="small" weight="plus">
                              {line.title}
                            </Text>
                            {line.sku && (
                              <Text
                                size="xsmall"
                                className="text-ui-fg-subtle"
                              >
                                {line.sku}
                              </Text>
                            )}
                          </>
                        )}
                      </div>
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => removeLine(line.key)}
                      >
                        <Trash className="text-ui-fg-subtle" />
                      </IconButton>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2">
                      <div className="flex flex-col gap-y-1">
                        <Label size="xsmall">
                          {t("procurement.create.lineQty")}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, { quantity: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-y-1">
                        <Label size="xsmall">
                          {t("procurement.create.lineUnit")}
                        </Label>
                        <Input
                          value={line.unit}
                          onChange={(e) =>
                            updateLine(line.key, { unit: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-y-1">
                        <Label size="xsmall">
                          {t("procurement.create.lineUnitCost")}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={line.unit_cost}
                          onChange={(e) =>
                            updateLine(line.key, { unit_cost: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-x-2">
                      <div className="flex flex-col gap-y-1">
                        <Label size="xsmall">
                          {t("procurement.create.expires")}
                        </Label>
                        <DatePicker
                          value={line.expires_at}
                          onChange={(d) =>
                            updateLine(line.key, { expires_at: d })
                          }
                        />
                      </div>
                      <Text size="small" className="text-ui-fg-subtle pb-2">
                        {t("procurement.create.lineCost")}: {formatTenge(lineCost)}
                      </Text>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-end">
                <Text size="base" weight="plus">
                  {t("procurement.receipt.total")}: {formatTenge(total)}
                </Text>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="receipt-note">{t("procurement.create.note")}</Label>
            <Input
              id="receipt-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {t("procurement.create.hint")}
          </Text>

          {/* Проводка не удалась: черновик сохранён, причина остаётся на экране. */}
          {postFailure && (
            <div className="border-ui-border-error bg-ui-bg-subtle flex flex-col gap-y-2 rounded-lg border p-3">
              <Text size="small" weight="plus" className="text-ui-fg-error">
                {t("procurement.create.postFailedTitle")}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {t("procurement.create.postFailedHint")}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                {postFailure.message}
              </Text>
              {onOpenReceipt && (
                <Button
                  size="small"
                  variant="secondary"
                  className="self-start"
                  onClick={openFailedDraft}
                >
                  {t("procurement.create.openDraft")}
                </Button>
              )}
            </div>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          {blocked && (
            <Text size="small" className="mr-auto text-ui-fg-subtle">
              {blocked}
            </Text>
          )}
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              {postFailure ? t("common.close") : t("common.cancel")}
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            variant="secondary"
            disabled={!canSaveDraft || isBusy}
            isLoading={saveDraftMutation.isPending}
            onClick={() => guardLocation(() => saveDraftMutation.mutate())}
          >
            {t("procurement.create.saveDraft")}
          </Button>
          <Button
            size="small"
            disabled={!canPost || isBusy}
            isLoading={saveAndPostMutation.isPending}
            onClick={() => guardLocation(() => saveAndPostMutation.mutate())}
          >
            {t("procurement.create.saveAndPost")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default ReceiptCreateDrawer
