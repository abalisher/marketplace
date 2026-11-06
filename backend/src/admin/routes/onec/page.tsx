import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray, ArrowPath, ArrowUpTray } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  StatusBadge,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDateTime } from "../../lib/date"
import {
  AdminOnecConnection,
  AdminOnecRun,
  AdminOnecTenantResponse,
  AdminOnecTenantsResponse,
  AdminOnecTestResult,
  ONEC_FIELDS,
  ONEC_FILE_ACCEPT,
  ONEC_FILE_MAX_BYTES,
  ONEC_INTERVALS,
  ONEC_RUN_STATUS_COLOR,
  OnecSource,
} from "../../lib/onec"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"

type Form = {
  source: OnecSource
  base_url: string
  stock_url: string
  login: string
  password: string
  enabled: boolean
  interval_minutes: number
  exclusive_catalog: boolean
  stock_location_id: string | null
}

const formFrom = (connection: AdminOnecConnection | null): Form => ({
  source: connection?.source ?? "http",
  base_url: connection?.base_url ?? "",
  stock_url: connection?.stock_url ?? "",
  login: connection?.login ?? "",
  password: "",
  enabled: connection?.enabled ?? false,
  interval_minutes: connection?.interval_minutes ?? 30,
  exclusive_catalog: connection?.exclusive_catalog ?? true,
  stock_location_id: connection?.stock_location_id ?? null,
})

// Пустое сообщение (ответ без тела, обрыв сети) — не пустой тост, а общая фраза.
const errorText = (error: unknown) =>
  (error as { message?: string })?.message?.trim() ||
  "Не удалось выполнить запрос — проверьте соединение и попробуйте ещё раз"

// Содержимое файла base64 (без префикса data:…) — так файл уходит в JSON.
const readBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

type PickedFile = { name: string; content_base64: string }

// Число в клетке: null — «—».
const show = (value: unknown) =>
  value === null || value === undefined || value === "" ? "—" : String(value)

// Сводка прогона одной строкой: что пришло и что с этим сделано.
const RunCounts = ({ run }: { run: AdminOnecRun }) => {
  const { t } = useTranslation()
  const parts = [
    [t("onec.runs.received"), run.received],
    [t("onec.runs.created"), run.created],
    [t("onec.runs.updated"), run.updated],
    [t("onec.runs.hidden"), run.hidden],
    [t("onec.runs.detached"), run.detached],
    [t("onec.runs.failed"), run.failed],
  ].filter(([, value], index) => index === 0 || Number(value) > 0)
  return (
    <Text size="small" className="text-ui-fg-subtle">
      {parts.map(([label, value]) => `${label}: ${value}`).join(" · ")}
    </Text>
  )
}

// Подключение одной компании: форма, проверка, запуск, журнал прогонов.
const TenantOnec = ({ tenantId }: { tenantId?: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const queryKey = ["onec", tenantId ?? "own"]
  const [form, setForm] = useState<Form>(formFrom(null))
  const [test, setTest] = useState<AdminOnecTestResult | null>(null)
  const [openRun, setOpenRun] = useState<string | null>(null)
  // Выбранный Excel-файл: сначала разбирается (предпросмотр), загружается в
  // каталог — отдельной кнопкой.
  const [picked, setPicked] = useState<PickedFile | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      sdk.client.fetch<AdminOnecTenantResponse>("/admin/onec", {
        query: tenantId ? { tenant_id: tenantId } : {},
      }),
    // Пока прогон идёт — следим за ним.
    refetchInterval: (query) =>
      (query.state.data as AdminOnecTenantResponse | undefined)?.runs?.[0]
        ?.status === "running"
        ? 3000
        : false,
  })

  useEffect(() => {
    if (data) {
      setForm(formFrom(data.connection))
    }
    // Форму перезаполняем только при смене подключения, а не при каждом опросе
    // журнала — иначе набранное продавцом стиралось бы раз в три секунды.
  }, [data?.connection?.updated_at, data?.connection?.id])

  const set = (patch: Partial<Form>) => setForm((prev) => ({ ...prev, ...patch }))
  const tenantBody = tenantId ? { tenant_id: tenantId } : {}

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/onec", {
        method: "POST",
        body:
          form.source === "file"
            ? {
                ...tenantBody,
                source: "file",
                exclusive_catalog: form.exclusive_catalog,
                stock_location_id: form.stock_location_id,
              }
            : {
                ...tenantBody,
                source: "http",
                base_url: form.base_url.trim(),
                stock_url: form.stock_url.trim() || null,
                login: form.login.trim(),
                ...(form.password ? { password: form.password } : {}),
                enabled: form.enabled,
                interval_minutes: form.interval_minutes,
                exclusive_catalog: form.exclusive_catalog,
                stock_location_id: form.stock_location_id,
              },
      }),
    onSuccess: () => {
      toast.success(t("onec.toast.saved"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (e) => toast.error(errorText(e)),
  })

  const check = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ result: AdminOnecTestResult }>("/admin/onec/check", {
        method: "POST",
        body: {
          ...tenantBody,
          ...(form.base_url.trim() ? { base_url: form.base_url.trim() } : {}),
          stock_url: form.stock_url.trim(),
          ...(form.login.trim() ? { login: form.login.trim() } : {}),
          ...(form.password ? { password: form.password } : {}),
        },
      }),
    onSuccess: ({ result }) => {
      setTest(result)
      toast.success(t("onec.toast.tested", { count: result.received }))
    },
    onError: (e) => {
      setTest(null)
      toast.error(errorText(e))
    },
  })

  const sync = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/onec/sync", { method: "POST", body: tenantBody }),
    onSuccess: () => {
      toast.success(t("onec.toast.syncStarted"))
      // Прогон заводит запись не мгновенно — перечитаем журнал чуть позже.
      setTimeout(() => queryClient.invalidateQueries({ queryKey }), 800)
    },
    onError: (e) => toast.error(errorText(e)),
  })

  // Excel: разобрать файл (apply = false) или загрузить его в каталог.
  const uploadFile = useMutation({
    mutationFn: ({ file, apply }: { file: PickedFile; apply: boolean }) =>
      sdk.client.fetch<{ result: AdminOnecTestResult; started?: boolean }>(
        "/admin/onec/file",
        {
          method: "POST",
          body: {
            ...tenantBody,
            file_name: file.name,
            content_base64: file.content_base64,
            apply,
          },
        }
      ),
    onSuccess: ({ result, started }) => {
      setTest(result)
      if (started) {
        toast.success(t("onec.toast.fileStarted"))
        setPicked(null)
        setTimeout(() => queryClient.invalidateQueries({ queryKey }), 800)
      } else {
        toast.success(t("onec.toast.fileRead", { count: result.received }))
      }
    },
    onError: (e) => toast.error(errorText(e)),
  })

  const pickFile = async (file: File | undefined) => {
    if (fileInput.current) {
      fileInput.current.value = ""
    }
    if (!file) {
      return
    }
    if (file.size > ONEC_FILE_MAX_BYTES) {
      toast.error(t("onec.file.tooBig"))
      return
    }
    try {
      const next = { name: file.name, content_base64: await readBase64(file) }
      setPicked(next)
      setTest(null)
      uploadFile.mutate({ file: next, apply: false })
    } catch (e) {
      toast.error(errorText(e))
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <Text size="small">{t("onec.loading")}</Text>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-error">
          {errorText(error)}
        </Text>
      </div>
    )
  }

  const connection = data.connection
  const running = data.runs[0]?.status === "running"
  const isFile = form.source === "file"
  // Файл грузится в каталог, только когда источник «Excel» уже сохранён (или
  // подключения нет вовсе — первая загрузка заведёт его сама).
  const fileSourceSaved = !connection || connection.source === "file"
  const canSave =
    isFile ||
    (!!form.base_url.trim() &&
      !!form.login.trim() &&
      (!!form.password || !!connection?.has_password))

  return (
    <>
      <div className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">{t("onec.connection.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {connection
                ? t(
                    connection.source === "file"
                      ? "onec.connection.productsFile"
                      : "onec.connection.products",
                    {
                      present: data.products.present,
                      total: data.products.total,
                    }
                  )
                : isFile
                  ? t("onec.connection.notConfiguredFile")
                  : t("onec.connection.notConfigured")}
            </Text>
          </div>
          {connection && connection.source === "http" && (
            <StatusBadge color={connection.enabled ? "green" : "grey"}>
              {connection.enabled
                ? t("onec.connection.enabled")
                : t("onec.connection.disabled")}
            </StatusBadge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <Label>{t("onec.source.label")}</Label>
            <Select
              value={form.source}
              onValueChange={(v) => {
                set({ source: v as OnecSource })
                setTest(null)
              }}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="http">{t("onec.source.http")}</Select.Item>
                <Select.Item value="file">{t("onec.source.file")}</Select.Item>
              </Select.Content>
            </Select>
          </div>
          {isFile && (
            <Text size="small" className="text-ui-fg-subtle md:col-span-2">
              {t("onec.source.fileHint")}
            </Text>
          )}
          {!isFile && (
          <>
          <div className="flex flex-col gap-y-2 md:col-span-2">
            <Label htmlFor="onec-url">{t("onec.form.url")}</Label>
            <Input
              id="onec-url"
              placeholder="https://1cfresh.kz/a/…/hs/items/getitems"
              value={form.base_url}
              onChange={(e) => set({ base_url: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2 md:col-span-2">
            <Label htmlFor="onec-stock-url">{t("onec.form.stockUrl")}</Label>
            <Input
              id="onec-stock-url"
              placeholder="https://1cfresh.kz/a/…/hs/items/getitems"
              value={form.stock_url}
              onChange={(e) => set({ stock_url: e.target.value })}
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("onec.form.stockUrlHint")}
            </Text>
          </div>
          </>
          )}
          {!isFile && (
          <>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="onec-login">{t("onec.form.login")}</Label>
            <Input
              id="onec-login"
              autoComplete="off"
              value={form.login}
              onChange={(e) => set({ login: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="onec-password">{t("onec.form.password")}</Label>
            <Input
              id="onec-password"
              type="password"
              autoComplete="new-password"
              placeholder={
                connection?.has_password ? t("onec.form.passwordSaved") : ""
              }
              value={form.password}
              onChange={(e) => set({ password: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>{t("onec.form.interval")}</Label>
            <Select
              value={String(form.interval_minutes)}
              onValueChange={(v) => set({ interval_minutes: Number(v) })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {ONEC_INTERVALS.map((minutes) => (
                  <Select.Item key={minutes} value={String(minutes)}>
                    {minutes < 60
                      ? t("onec.form.minutes", { count: minutes })
                      : t("onec.form.hours", { count: minutes / 60 })}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          </>
          )}
          {data.locations.length > 1 && (
            <div className="flex flex-col gap-y-2">
              <Label>
                {t(isFile ? "onec.form.locationFile" : "onec.form.location")}
              </Label>
              <Select
                value={form.stock_location_id ?? data.locations[0].id}
                onValueChange={(v) => set({ stock_location_id: v })}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {data.locations.map((location) => (
                    <Select.Item key={location.id} value={location.id}>
                      {location.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          )}
          {!isFile && (
          <div className="flex items-start gap-x-3 md:col-span-2">
            <Switch
              id="onec-enabled"
              checked={form.enabled}
              onCheckedChange={(checked) => set({ enabled: checked })}
            />
            <div>
              <Label htmlFor="onec-enabled">{t("onec.form.enabled")}</Label>
              <Text size="small" className="text-ui-fg-subtle">
                {t("onec.form.enabledHint")}
              </Text>
            </div>
          </div>
          )}
          <div className="flex items-start gap-x-3 md:col-span-2">
            <Switch
              id="onec-exclusive"
              checked={form.exclusive_catalog}
              onCheckedChange={(checked) => set({ exclusive_catalog: checked })}
            />
            <div>
              <Label htmlFor="onec-exclusive">
                {t(isFile ? "onec.form.exclusiveFile" : "onec.form.exclusive")}
              </Label>
              <Text size="small" className="text-ui-fg-subtle">
                {t(isFile ? "onec.form.exclusiveHintFile" : "onec.form.exclusiveHint")}
              </Text>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="small"
            onClick={() => save.mutate()}
            isLoading={save.isPending}
            disabled={!canSave}
          >
            {t("onec.actions.save")}
          </Button>
          {!isFile && (
            <>
              <Button
                size="small"
                variant="secondary"
                onClick={() => check.mutate()}
                isLoading={check.isPending}
                disabled={!form.base_url.trim() && !connection}
              >
                {t("onec.actions.test")}
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => sync.mutate()}
                isLoading={sync.isPending}
                disabled={!connection || running}
              >
                <ArrowPath />
                {running ? t("onec.actions.syncing") : t("onec.actions.sync")}
              </Button>
            </>
          )}
        </div>
      </div>

      {isFile && (
        <div className="flex flex-col gap-y-3 px-6 py-4">
          <Heading level="h2">{t("onec.file.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("onec.file.columns")}
          </Text>
          <input
            ref={fileInput}
            type="file"
            accept={ONEC_FILE_ACCEPT}
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => fileInput.current?.click()}
              isLoading={uploadFile.isPending && !uploadFile.variables?.apply}
            >
              <ArrowUpTray />
              {t("onec.file.pick")}
            </Button>
            <Button
              size="small"
              onClick={() => picked && uploadFile.mutate({ file: picked, apply: true })}
              isLoading={uploadFile.isPending && !!uploadFile.variables?.apply}
              disabled={!picked || !test || running || !fileSourceSaved}
            >
              {running ? t("onec.file.uploading") : t("onec.file.upload")}
            </Button>
            <a
              // Панель отдаёт сам бэкенд, вход — сессией: ссылка скачивает шаблон
              // без отдельного запроса.
              href="/admin/onec/template"
              className="inline-flex items-center gap-x-1 txt-compact-small text-ui-fg-interactive hover:underline"
            >
              <ArrowDownTray />
              {t("onec.file.template")}
            </a>
          </div>
          {!fileSourceSaved && (
            <Text size="small" className="text-ui-fg-error">
              {t("onec.file.switchFirst")}
            </Text>
          )}
        </div>
      )}

      {test && (
        <div className="flex flex-col gap-y-3 px-6 py-4">
          <Heading level="h2">
            {test.sheet ? t("onec.file.title") : t("onec.test.title")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {test.sheet
              ? t("onec.file.summary", {
                  file: picked?.name ?? "",
                  sheet: test.sheet,
                  row: test.header_row,
                  received: test.received,
                  total: test.total,
                })
              : t("onec.test.summary", {
                  received: test.received,
                  total: test.total,
                  seconds: (test.duration_ms / 1000).toFixed(1),
                })}
          </Text>
          {test.stock && (
            <Text size="small" className="text-ui-fg-subtle">
              {t("onec.test.stock", {
                received: test.stock.received,
                matched: test.stock.matched,
              })}{" "}
              {test.stock.applied
                ? t("onec.test.stockApplied")
                : test.stock.note ?? ""}
            </Text>
          )}
          <div className="flex flex-wrap gap-2">
            {ONEC_FIELDS.map((field) => (
              <StatusBadge
                key={field}
                color={test.fields[field] ? "green" : "grey"}
              >
                {t(`onec.field.${field}`)}
                {test.fields[field]
                  ? ` ← ${[test.fields[field], ...(field === "name" ? test.name_parts ?? [] : [])]
                      .map((header) => `«${header}»`)
                      .join(" + ")}`
                  : ` — ${t("onec.test.notFound")}`}
              </StatusBadge>
            ))}
          </div>
          {test.sample.length > 0 && (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t("onec.field.name")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("onec.field.code")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("onec.field.unit")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("onec.field.price")}</Table.HeaderCell>
                  {test.fields.cost && (
                    <Table.HeaderCell>{t("onec.field.cost")}</Table.HeaderCell>
                  )}
                  <Table.HeaderCell>{t("onec.field.stock")}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {test.sample.map((item) => (
                  <Table.Row key={item.key}>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{show(item.article ?? item.code)}</Table.Cell>
                    <Table.Cell>{show(item.unit)}</Table.Cell>
                    <Table.Cell>{show(item.price)}</Table.Cell>
                    {test.fields.cost && <Table.Cell>{show(item.cost)}</Table.Cell>}
                    <Table.Cell>{show(item.stock)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
          {test.issues.length > 0 && (
            <ul className="list-disc pl-5">
              {test.issues.map((issue, index) => (
                <li key={index}>
                  <Text size="small" className="text-ui-fg-subtle">
                    {[issue.name, issue.key].filter(Boolean).join(" · ")}
                    {issue.name || issue.key ? ": " : ""}
                    {issue.message}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Heading level="h2">{t("onec.runs.title")}</Heading>
        {data.runs.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t("onec.runs.empty")}
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("onec.runs.started")}</Table.HeaderCell>
                <Table.HeaderCell>{t("onec.runs.status")}</Table.HeaderCell>
                <Table.HeaderCell>{t("onec.runs.result")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.runs.map((run) => (
                <Table.Row
                  key={run.id}
                  className="cursor-pointer"
                  onClick={() => setOpenRun(openRun === run.id ? null : run.id)}
                >
                  <Table.Cell>
                    <div className="flex flex-col">
                      <span>{formatDateTime(run.started_at)}</span>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {t(`onec.trigger.${run.trigger}`)}
                        {run.file_name ? ` · ${run.file_name}` : ""}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={ONEC_RUN_STATUS_COLOR[run.status]}>
                      {t(`onec.status.${run.status}`)}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-y-1 py-2">
                      <RunCounts run={run} />
                      {run.error && (
                        <Text size="small" className="text-ui-fg-error">
                          {run.error}
                        </Text>
                      )}
                      {openRun === run.id &&
                        run.issues.map((issue, index) => (
                          <Text key={index} size="xsmall" className="text-ui-fg-subtle">
                            {[issue.name, issue.key].filter(Boolean).join(" · ")}
                            {issue.name || issue.key ? ": " : ""}
                            {issue.message}
                          </Text>
                        ))}
                      {openRun !== run.id && run.issues.length > 0 && (
                        <Text size="xsmall" className="text-ui-fg-interactive">
                          {t("onec.runs.issues", { count: run.issues.length })}
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </>
  )
}

// Раздел «Интеграция 1С»: у каждой компании площадки своя база 1С, и её каталог
// (товары, цены, остатки) повторяет 1С. Продавец компании видит своё
// подключение; сотрудник площадки выбирает компанию из списка.
const OnecPage = () => {
  const { t } = useTranslation()
  const [tenantId, setTenantId] = useState<string | undefined>(undefined)

  // Без tenant_id сотрудник площадки получает список компаний, продавец —
  // сразу своё подключение.
  const { data, isLoading } = useQuery({
    queryKey: ["onec", "root"],
    queryFn: () =>
      sdk.client.fetch<AdminOnecTenantsResponse | AdminOnecTenantResponse>(
        "/admin/onec"
      ),
  })
  const tenants = data && "tenants" in data ? data.tenants : null

  useEffect(() => {
    if (tenants?.length && !tenantId) {
      setTenantId(tenants[0].id)
    }
  }, [tenants, tenantId])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <Heading>{t("onec.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("onec.subtitle")}
          </Text>
        </div>
        {tenants && tenants.length > 0 && (
          <div className="w-64">
            <Select value={tenantId} onValueChange={setTenantId}>
              <Select.Trigger>
                <Select.Value placeholder={t("onec.pickTenant")} />
              </Select.Trigger>
              <Select.Content>
                {tenants.map((tenant) => (
                  <Select.Item key={tenant.id} value={tenant.id}>
                    {tenant.name}
                    {tenant.connection
                      ? tenant.connection.source === "file"
                        ? " · Excel"
                        : " · 1С"
                      : ""}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="px-6 py-4">
          <Text size="small">{t("onec.loading")}</Text>
        </div>
      ) : tenants ? (
        tenants.length === 0 ? (
          <div className="px-6 py-4">
            <Text size="small">{t("onec.noTenants")}</Text>
          </div>
        ) : tenantId ? (
          <TenantOnec key={tenantId} tenantId={tenantId} />
        ) : null
      ) : (
        <TenantOnec />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "1C & Excel", ru: "1С и Excel" }),
  icon: ArrowPath,
})

export default OnecPage
