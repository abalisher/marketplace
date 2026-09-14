import {
  CheckCircleSolid,
  EllipsisHorizontal,
  XCircleSolid,
} from "@medusajs/icons"
import {
  Button,
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  StatusBadge,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import BlockDriverPrompt from "../../../components/block-driver-prompt"
import { useDriverModeration } from "../../../hooks/use-driver-moderation"
import { formatDate, formatDateTime } from "../../../lib/date"
import {
  AdminDriverResponse,
  DRIVER_STATUS_META,
} from "../../../lib/driver"
import { formatPhone } from "../../../lib/phone"
import { sdk } from "../../../lib/sdk"

// Карточка водителя-gig: профиль, который он заполнил о себе сам, текущий
// допуск с причиной и кто это решил. Решения — в «...»-меню шапки (идиома
// карточек ядра), они же есть в строке очереди.
const DriverDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { activateMutation, blockMutation, activateWithConfirm } =
    useDriverModeration()
  const [blockOpen, setBlockOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-drivers", id],
    queryFn: () =>
      sdk.client.fetch<AdminDriverResponse>(`/admin/drivers/${id}`),
    enabled: !!id,
  })
  const driver = data?.driver

  if (isLoading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">{t("common.loading")}</Text>
      </Container>
    )
  }

  if (!driver) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">{t("drivers.detail.notFound")}</Text>
      </Container>
    )
  }

  const statusMeta = DRIVER_STATUS_META[driver.status]
  const actionsPending = activateMutation.isPending || blockMutation.isPending
  const fullName = driver.full_name?.trim() ?? ""
  const hasName = !!fullName
  const name = fullName || formatPhone(driver.phone)

  return (
    <div className="flex flex-col gap-y-3">
      <Button
        variant="transparent"
        size="small"
        className="text-ui-fg-subtle w-fit"
        asChild
      >
        <Link to="/drivers">{t("drivers.detail.back")}</Link>
      </Button>

      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-3">
              {/* Пока профиль не заполнен, человека называем его номером —
                  другого имени у нас нет. Тогда же номер уходит из подписи
                  под заголовком: дважды один и тот же номер — не подпись. */}
              <Heading level="h1">{name}</Heading>
              <StatusBadge color={statusMeta.color}>
                {t(statusMeta.label)}
              </StatusBadge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {hasName
                ? t("drivers.detail.submitted", {
                    phone: formatPhone(driver.phone),
                    date: formatDate(driver.created_at),
                  })
                : t("drivers.detail.submittedNoName", {
                    date: formatDate(driver.created_at),
                  })}
            </Text>
          </div>
          {/* Действия — в «...»-меню, как на стандартных карточках дашборда. */}
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent">
                <EllipsisHorizontal />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {driver.status !== "active" && (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => activateWithConfirm(driver)}
                  // Незаполненный профиль сервер допустить не даст — пункт
                  // остаётся видимым, но недоступным, а причину объясняет
                  // предупреждение ниже.
                  disabled={actionsPending || !driver.profile_complete}
                >
                  <CheckCircleSolid className="text-ui-fg-subtle" />
                  {t("drivers.action.activate")}
                </DropdownMenu.Item>
              )}
              {driver.status !== "blocked" && (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setBlockOpen(true)}
                  disabled={actionsPending}
                >
                  <XCircleSolid className="text-ui-fg-subtle" />
                  {t("drivers.action.block")}
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
        {!driver.profile_complete && (
          <div className="flex flex-col gap-y-1 px-6 py-4">
            <Text size="small" weight="plus">
              {t("drivers.detail.incompleteTitle")}
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {t("drivers.detail.incompleteDescription")}
            </Text>
          </div>
        )}
        {/* Причина остаётся на карточке и после разблокировки: она объясняет,
            почему водителя когда-то закрыли. */}
        {driver.status_note && (
          <div className="flex flex-col gap-y-1 px-6 py-4">
            <Text size="small" weight="plus">
              {t(
                driver.status === "blocked"
                  ? "drivers.detail.blockReason"
                  : "drivers.detail.previousBlockReason"
              )}
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {driver.status_note}
            </Text>
          </div>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">{t("drivers.detail.vehicle")}</Heading>
        </div>
        <div className="grid grid-cols-2 gap-y-3 px-6 py-4">
          <Text size="small" weight="plus" className="text-ui-fg-subtle">
            {t("drivers.detail.vehicleModel")}
          </Text>
          <Text size="small">{driver.vehicle_model?.trim() || "—"}</Text>
          <Text size="small" weight="plus" className="text-ui-fg-subtle">
            {t("drivers.detail.vehiclePlate")}
          </Text>
          <Text size="small">{driver.vehicle_plate?.trim() || "—"}</Text>
          <Text size="small" weight="plus" className="text-ui-fg-subtle">
            {t("drivers.colCapacity")}
          </Text>
          <Text size="small">
            {driver.capacity_kg == null
              ? "—"
              : t("drivers.capacityValue", { value: driver.capacity_kg })}
          </Text>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">{t("drivers.detail.decision")}</Heading>
        </div>
        {driver.status_changed_at ? (
          <div className="grid grid-cols-2 gap-y-3 px-6 py-4">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("drivers.detail.decidedBy")}
            </Text>
            {/* Именем сотрудника: `user_id` сервер наружу не отдаёт, а учётку
                могли удалить — тогда прочерк. */}
            <Text size="small">{driver.status_changed_by_name ?? "—"}</Text>
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("drivers.detail.decidedAt")}
            </Text>
            <Text size="small">{formatDateTime(driver.status_changed_at)}</Text>
          </div>
        ) : (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              {t("drivers.detail.noDecision")}
            </Text>
          </div>
        )}
      </Container>

      <BlockDriverPrompt
        driver={blockOpen ? driver : null}
        onClose={() => setBlockOpen(false)}
        onSubmit={(driverId, reason) =>
          blockMutation.mutate(
            { id: driverId, reason },
            { onSuccess: () => setBlockOpen(false) }
          )
        }
        isPending={blockMutation.isPending}
      />
    </div>
  )
}

export default DriverDetailPage
