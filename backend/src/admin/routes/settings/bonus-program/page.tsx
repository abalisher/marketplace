import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons"
import {
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import BonusConfigDrawer from "../../../components/bonus-config-drawer"
import {
  AdminBonusConfigResponse,
  BONUS_SEGMENT_KEYS,
} from "../../../lib/bonus"
import { sdk } from "../../../lib/sdk"
import { routeLabel } from "../../../lib/route-label"

// Строка «метка — значение» — идиома SectionRow детальных страниц ядра.
const CardRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
    <Text size="small" weight="plus" leading="compact">
      {label}
    </Text>
    <Text size="small" leading="compact">
      {children}
    </Text>
  </div>
)

// Страница настроек бонусной программы (Settings → Bonus Program) — идиома
// страниц ядра Settings (Store/Regions): секция «метка — значение», правка
// через Drawer из «...»-меню. Данные — GET/POST /admin/bonus-config.
const BonusProgramPage = () => {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["bonus-config"],
    queryFn: () =>
      sdk.client.fetch<AdminBonusConfigResponse>("/admin/bonus-config"),
  })
  const config = data?.bonus_config ?? null

  const overrides = config?.segment_percents ?? null
  const overrideRows = BONUS_SEGMENT_KEYS.filter(
    (key) => overrides?.[key] != null
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("bonus.program.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("bonus.program.subtitle")}
          </Text>
        </div>
        {/* Действия — в «...»-меню, как у секций стандартных страниц ядра. */}
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <IconButton size="small" variant="transparent">
              <EllipsisHorizontal />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              className="gap-x-2"
              onClick={() => setEditOpen(true)}
              disabled={isLoading || !config}
            >
              <PencilSquare className="text-ui-fg-subtle" />
              {t("common.edit")}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      {config ? (
        <>
          <CardRow label={t("bonus.program.accrualPercent")}>
            {config.accrual_percent}%
          </CardRow>
          <CardRow label={t("bonus.program.segmentOverrides")}>
            {overrideRows.length ? (
              <span className="flex flex-col gap-y-1">
                {overrideRows.map((key) => (
                  <span key={key}>
                    {t(`bonus.segment.${key}`)}: {overrides![key]}%
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )}
          </CardRow>
          <CardRow label={t("bonus.program.maxSpendPercent")}>
            {t("bonus.program.maxSpendValue", {
              value: config.max_spend_percent,
            })}
          </CardRow>
          <CardRow label={t("bonus.program.expiry")}>
            {config.expiry_days != null
              ? t("bonus.program.expiryValue", { days: config.expiry_days })
              : t("bonus.program.disabled")}
          </CardRow>
          <CardRow label={t("bonus.program.expiryNotice")}>
            {config.expiry_notice_days > 0
              ? t("bonus.program.expiryNoticeValue", {
                  days: config.expiry_notice_days,
                })
              : t("bonus.program.disabled")}
          </CardRow>
          <CardRow label={t("bonus.program.returnWindow")}>
            {t("bonus.program.returnWindowValue", {
              days: config.return_window_days,
            })}
          </CardRow>
        </>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("bonus.program.loadFailed")}
          </Text>
        </div>
      )}

      {config && (
        <BonusConfigDrawer
          config={config}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Bonus Program", ru: "Бонусная программа" }),
})

export default BonusProgramPage
