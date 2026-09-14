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
import DocumentRequisitesDrawer from "../../../components/document-requisites-drawer"
import {
  AdminDocumentSettingsResponse,
  DOCUMENT_SETTINGS_FIELDS,
} from "../../../lib/documents"
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

// Страница реквизитов продавца (Settings → Document Requisites) — идиома
// settings/bonus-program: секция «метка — значение», правка через Drawer из
// «...»-меня. Данные — GET/POST /admin/document-settings.
const DocumentRequisitesPage = () => {
  const { t } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["document-settings"],
    queryFn: () =>
      sdk.client.fetch<AdminDocumentSettingsResponse>(
        "/admin/document-settings"
      ),
  })
  const settings = data?.document_settings ?? null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("documents.requisites.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("documents.requisites.subtitle")}
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
              disabled={isLoading || !settings}
            >
              <PencilSquare className="text-ui-fg-subtle" />
              {t("common.edit")}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      {settings ? (
        DOCUMENT_SETTINGS_FIELDS.map(({ key, label }) => (
          <CardRow key={key} label={t(label)}>
            {settings[key] ? settings[key] : "—"}
          </CardRow>
        ))
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("documents.requisites.loadFailed")}
          </Text>
        </div>
      )}

      {settings && (
        <DocumentRequisitesDrawer
          settings={settings}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Document Requisites", ru: "Реквизиты документов" }),
})

export default DocumentRequisitesPage
