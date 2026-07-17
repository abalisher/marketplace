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
import BonusConfigDrawer from "../../../components/bonus-config-drawer"
import {
  AdminBonusConfigResponse,
  BONUS_SEGMENT_KEYS,
} from "../../../lib/bonus"
import { sdk } from "../../../lib/sdk"

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
          <Heading>Bonus Program</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Accrual percents, spending cap and expiry of buyer bonuses.
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
              Edit
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      {config ? (
        <>
          <CardRow label="Accrual percent">{config.accrual_percent}%</CardRow>
          <CardRow label="Segment overrides">
            {overrideRows.length ? (
              <span className="flex flex-col gap-y-1">
                {overrideRows.map((key) => (
                  <span key={key} className="capitalize">
                    {key}: {overrides![key]}%
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )}
          </CardRow>
          <CardRow label="Max spend percent">
            {config.max_spend_percent}% of order total
          </CardRow>
          <CardRow label="Expiry">
            {config.expiry_days != null
              ? `${config.expiry_days} days`
              : "Disabled"}
          </CardRow>
          <CardRow label="Expiry notice">
            {config.expiry_notice_days > 0
              ? `${config.expiry_notice_days} days before expiry`
              : "Disabled"}
          </CardRow>
          <CardRow label="Return window">
            {config.return_window_days} days after delivery
          </CardRow>
        </>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? "Loading…" : "Failed to load bonus settings."}
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
  label: "Bonus Program",
})

export default BonusProgramPage
