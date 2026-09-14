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
import FeatureDisabledNotice from "../../../components/feature-disabled-notice"
import ScoringConfigDrawer from "../../../components/scoring-config-drawer"
import { useFeatureFlags } from "../../../hooks/use-feature-flags"
import { formatTenge } from "../../../lib/money"
import {
  AdminScoringConfigResponse,
  SCORING_CONFIG_FIELDS,
} from "../../../lib/scoring"
import { sdk } from "../../../lib/sdk"
import { routeLabel } from "../../../lib/route-label"

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
  const { t } = useTranslation()
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
          <Heading>{t("scoring.rules.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("scoring.rules.subtitle")}
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
              {t("common.edit")}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      {config ? (
        // Суммы показываем в тенге: «Лимит на балл 5000» без валюты управляющий
        // читал как баллы (Ф-прогон T4.6).
        SCORING_CONFIG_FIELDS.map(({ key, label, money }) => (
          <CardRow key={key} label={t(label)}>
            {money ? formatTenge(config[key]) : config[key]}
          </CardRow>
        ))
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("scoring.rules.loadFailed")}
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

// Юрлица заморожены на MVP (T10.9): адрес остаётся рабочим, но экран не
// монтируется, пока домен выключен, — открывший его видит объяснение.
const ScoringRulesRoute = () => {
  const { t } = useTranslation()
  const { data: featureFlags } = useFeatureFlags()

  if (!featureFlags.companies) {
    return (
      <FeatureDisabledNotice message={t("common.featureDisabled.companies")} />
    )
  }

  return <ScoringRulesPage />
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Scoring Rules", ru: "Правила скоринга" }),
})

export default ScoringRulesRoute
