import { orderLabel } from "../../lib/order-label"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ListCheckbox } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  StatusBadge,
  Text,
  clx,
  toast,
} from "@medusajs/ui"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTableListError } from "../../components/data-table-list-error"
import {
  ASSEMBLY_CHIPS,
  AdminAssemblyTasksResponse,
  AssemblyTask,
  AssemblyTaskItem,
  TASK_STATUS_META,
  assemblyChipCount,
  itemMark,
} from "../../lib/assembly"
import { formatDateTime } from "../../lib/date"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import "../../styles/orders.css"

const PAGE_SIZE = 50

// Рабочее место сборщика (сборщик компании или площадки). Видны задания
// подтверждённых заказов своей компании (у сборщика с группой — только его
// категории): взять задание, отметить набранное у каждой позиции, закрыть.
// Последнее закрытое задание само переводит заказ в «Собран», и он появляется
// в разделе «Отгрузка». Всё фильтрует бэкенд (GET /admin/assembly-tasks).
//
// Экран делят сборщик (в его сайдбаре — сборка, отгрузка, склад и отзывы) и
// администратор площадки; у продавцов пункт скрыт (styles/shell.css). Администратор видит все задания и может
// вести любые — права сборщика ему открыты.
const PickerPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [chipKey, setChipKey] = useState(ASSEMBLY_CHIPS[0].key)
  const chip = ASSEMBLY_CHIPS.find((entry) => entry.key === chipKey) ?? ASSEMBLY_CHIPS[0]

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["assembly-tasks", chip.key],
    queryFn: () =>
      sdk.client.fetch<AdminAssemblyTasksResponse>("/admin/assembly-tasks", {
        query: {
          limit: PAGE_SIZE,
          ...(chip.statuses ? { status: chip.statuses.join(",") } : {}),
        },
      }),
    placeholderData: keepPreviousData,
    // Задания появляются, когда продавец подтверждает заказ, — очередь
    // обновляется сама.
    refetchInterval: 30_000,
  })

  const action = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: Record<string, unknown> }) =>
      sdk.client.fetch(`/admin/assembly-tasks/${path}`, {
        method: "POST",
        body: body ?? {},
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assembly-tasks"] })
      void queryClient.invalidateQueries({ queryKey: ["shipping-queue"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const tasks = data?.assembly_tasks ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">{t("picker.title")}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("picker.subtitle")}
        </Text>
      </div>

      <div className="sm-chips px-6 py-3">
        {ASSEMBLY_CHIPS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            aria-pressed={entry.key === chip.key}
            className={clx("sm-chip", { "sm-chip-active": entry.key === chip.key })}
            onClick={() => setChipKey(entry.key)}
          >
            {t(entry.label)}
            {data && (
              <span className="sm-chip-count">
                {assemblyChipCount(data.counts, entry)}
              </span>
            )}
          </button>
        ))}
      </div>

      {isError ? (
        <DataTableListError message={t("picker.error")} onRetry={refetch} />
      ) : isLoading ? (
        <Text className="text-ui-fg-subtle px-6 py-8">{t("common.loading")}</Text>
      ) : tasks.length ? (
        <div className="divide-y">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isPending={action.isPending}
              onAction={(path, body) => action.mutate({ path, body })}
            />
          ))}
        </div>
      ) : (
        <Text className="text-ui-fg-subtle px-6 py-8">
          {chip.key === "active" ? t("picker.emptyActive") : t("picker.empty")}
        </Text>
      )}
    </Container>
  )
}

const TaskCard = ({
  task,
  isPending,
  onAction,
}: {
  task: AssemblyTask
  isPending: boolean
  onAction: (path: string, body?: Record<string, unknown>) => void
}) => {
  const { t } = useTranslation()
  const meta = TASK_STATUS_META[task.status]
  const allMarked = task.items_marked === task.items_total

  return (
    <div className="flex flex-col gap-y-3 px-6 py-4" data-sm-task={task.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <Text weight="plus">
            {t("picker.order", { id: orderLabel(task.order_number, task.order_display_id) })} ·{" "}
            {task.category_name}
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            {[task.customer_name, task.created_at ? formatDateTime(task.created_at) : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </div>
        <StatusBadge color={meta.color}>{t(meta.label)}</StatusBadge>
      </div>

      <ul className="flex flex-col gap-y-2">
        {task.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            editable={task.status === "picking"}
            isPending={isPending}
            onMark={(body) => onAction(`${task.id}/items/${item.id}`, body)}
          />
        ))}
      </ul>

      {task.status === "pending" && (
        <div>
          <Button size="small" isLoading={isPending} onClick={() => onAction(`${task.id}/start`)}>
            {t("picker.start")}
          </Button>
        </div>
      )}
      {task.status === "picking" && (
        <div className="flex items-center gap-x-3">
          <Button
            size="small"
            disabled={!allMarked}
            isLoading={isPending}
            onClick={() => onAction(`${task.id}/complete`)}
          >
            {t("picker.complete")}
          </Button>
          {!allMarked && (
            <Text size="small" className="text-ui-fg-subtle">
              {t("picker.markAll", {
                left: task.items_total - task.items_marked,
              })}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}

const ItemRow = ({
  item,
  editable,
  isPending,
  onMark,
}: {
  item: AssemblyTaskItem
  editable: boolean
  isPending: boolean
  onMark: (body: Record<string, unknown>) => void
}) => {
  const { t } = useTranslation()
  const [picked, setPicked] = useState(String(item.quantity))
  const marked = item.status !== "pending"

  return (
    <li className="bg-ui-bg-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2">
      <div className="flex flex-col">
        <Text size="small" weight="plus">
          {item.title}
        </Text>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {[item.sku, t("picker.need", { qty: item.quantity })]
            .filter(Boolean)
            .join(" · ")}
          {marked
            ? ` · ${t(`picker.item.${item.status}`, { picked: item.picked_quantity })}`
            : ""}
        </Text>
      </div>
      {editable && (
        <div className="flex items-center gap-x-2">
          <Input
            size="small"
            type="number"
            min={0}
            max={item.quantity}
            value={picked}
            onChange={(event) => setPicked(event.target.value)}
            className="w-20"
            aria-label={t("picker.pickedLabel")}
          />
          <Button
            size="small"
            variant="secondary"
            disabled={isPending || picked.trim() === ""}
            onClick={() => onMark(itemMark(item, Number(picked)))}
          >
            {marked ? t("picker.remark") : t("picker.mark")}
          </Button>
        </div>
      )}
    </li>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Assembly", ru: "Сборка" }),
  icon: ListCheckbox,
})

export default PickerPage
