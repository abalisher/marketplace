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
import ScoringConfigDrawer from "../../../components/scoring-config-drawer"
import {
  AdminScoringConfigResponse,
  SCORING_CONFIG_FIELDS,
} from "../../../lib/scoring"
import { sdk } from "../../../lib/sdk"

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

// Настройки правил скоринга (Settings → Scoring Rules) — идиома
// settings/bonus-program: секция «метка — значение» + Edit-drawer. Данные —
// GET/POST /admin/scoring-config.
const ScoringRulesPage = () => {
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["scoring-config"],
    queryFn: () =>
      sdk.client.fetch<AdminScoringConfigResponse>("/admin/scoring-config"),
  })
  const config = data?.scoring_config ?? null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Scoring Rules</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Configurable weights and thresholds for company deferral scoring.
          </Text>
        </div>
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
        SCORING_CONFIG_FIELDS.map(({ key, label }) => (
          <CardRow key={key} label={label}>
            {config[key]}
          </CardRow>
        ))
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? "Loading…" : "Failed to load scoring rules."}
          </Text>
        </div>
      )}

      {config && (
        <ScoringConfigDrawer
          config={config}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Scoring Rules",
})

export default ScoringRulesPage
