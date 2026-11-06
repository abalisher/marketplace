import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { ArrowDownTray, DocumentText } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  StatusBadge,
  Text,
  toast,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useFeatureFlags } from "../hooks/use-feature-flags"
import { useTranslation } from "react-i18next"
import { useDocuments } from "../hooks/use-documents"
import { formatDateTime } from "../lib/date"
import {
  AdminOrderDocument,
  AdminOrderDocumentsResponse,
  DOCUMENT_TYPE_META,
  DocumentType,
} from "../lib/documents"
import { sdk } from "../lib/sdk"

// Типы, которые продавец выпускает руками. Внутренний акт — только по заказам
// юрлиц (бэкенд отвечает 400 по заказу физлица), но кнопку показываем всегда:
// признака юрлица на ядровой странице заказа нет, а сообщение об отказе
// объясняет причину.
const ISSUABLE_TYPES: DocumentType[] = ["invoice", "waybill", "internal_avr"]

// Widget документов заказа на ядровой странице заказа: список всех документов-
// оснований (счёт/накладная/АВР, все версии) со скачиванием PDF, ручным
// выпуском и отметкой «отправлен покупателю», плюс кнопка экспорта данных для 1С.
// Данные — GET /admin/orders/:id/documents.
//
// T4.9 (блокеры 19–20 фокус-группы T4.6): до этого документы появлялись только
// сами, по событиям заказа — если событие не сработало или реквизиты продавца
// были пусты, продавец не мог ничего сделать («счёт не выпущен, кнопки нет»).
// Теперь выпуск доступен кнопкой, а при неполных реквизитах кнопки выключены и
// экран называет причину вместо молчания.
const OrderDocumentsCardWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const { t } = useTranslation()
  const { issueMutation, markSentMutation } = useDocuments()
  const { data: featureFlags } = useFeatureFlags()

  const { data: response, isLoading } = useQuery({
    queryKey: ["order-documents", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminOrderDocumentsResponse>(
        `/admin/orders/${data.id}/documents`
      ),
  })

  // Готовность реквизитов продавца этого заказа считает бэкенд (у заказа
  // компании — её реквизиты, у заказа площадки — площадки). Пока ответа нет,
  // выпуск не предлагаем и причину не называем.
  const requisites = response?.requisites
  const requisitesReady = requisites?.ready ?? false

  const documents = response?.documents ?? []
  const latestByType = new Map<string, AdminOrderDocument>(
    documents.filter((doc) => doc.is_latest).map((doc) => [doc.type, doc])
  )

  // Экспорт для 1С: тянем JSON через admin-API (нужен auth) и отдаём файлом.
  const exportForAccounting = async () => {
    try {
      const payload = await sdk.client.fetch<unknown>(
        `/admin/orders/${data.id}/documents/export`
      )
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `order-${data.display_id ?? data.id}-1c-export.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("documents.widget.title")}</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={exportForAccounting}
          disabled={isLoading || documents.length === 0}
        >
          <ArrowDownTray className="text-ui-fg-subtle" />
          {t("documents.widget.export")}
        </Button>
      </div>

      {/* Выпуск документов. Кнопка называет действие по состоянию: «Выпустить»
          для нового документа, «Переиздать» — если документ уже есть (номер
          сохранится, версия увеличится). */}
      <div className="flex flex-col gap-y-2 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {ISSUABLE_TYPES.filter(
            // Внутренний АВР — только для заказов юрлиц: пока юрлица на
            // площадке выключены (FEATURE_COMPANIES), кнопки нет.
            (type) => type !== "internal_avr" || featureFlags.companies
          ).map((type) => {
            const existing = latestByType.get(type)
            return (
              <Button
                key={type}
                size="small"
                variant={existing ? "secondary" : "primary"}
                disabled={!requisitesReady || issueMutation.isPending}
                onClick={() =>
                  issueMutation.mutate({ orderId: data.id, type })
                }
              >
                {/* Подпись — на каждый тип своя: подстановка названия в шаблон
                    ломает падеж («Выпустить Накладная»). */}
                {t(
                  `documents.widget.${existing ? "reissue" : "issue"}.${type}`
                )}
              </Button>
            )
          })}
        </div>
        {requisites && !requisites.ready && (
          <Text size="small" className="text-ui-fg-error">
            {t(
              requisites.tenant
                ? "documents.widget.requisitesMissingTenant"
                : "documents.widget.requisitesMissing"
            )}
          </Text>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("documents.widget.empty")}
          </Text>
        </div>
      ) : (
        <ul className="flex flex-col">
          {documents.map((doc: AdminOrderDocument) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-x-4 px-6 py-3"
            >
              <div className="flex items-center gap-x-3">
                <DocumentText className="text-ui-fg-subtle" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-2">
                    <Text size="small" weight="plus">
                      {DOCUMENT_TYPE_META[doc.type]
                        ? t(DOCUMENT_TYPE_META[doc.type].label)
                        : doc.type}{" "}
                      · {doc.number}
                    </Text>
                    {doc.is_latest ? (
                      <StatusBadge color="green">{t("documents.widget.latest")}</StatusBadge>
                    ) : (
                      <StatusBadge color="grey">v{doc.version}</StatusBadge>
                    )}
                    {doc.sent_to_buyer_at && (
                      <StatusBadge color="blue">
                        {t("documents.widget.sent")}
                      </StatusBadge>
                    )}
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {formatDateTime(doc.created_at)}
                    {doc.sent_to_buyer_at
                      ? ` · ${t("documents.widget.sentAt", {
                          date: formatDateTime(doc.sent_to_buyer_at),
                        })}`
                      : ""}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-x-2">
                {doc.is_latest && !doc.sent_to_buyer_at && (
                  <Button
                    size="small"
                    variant="transparent"
                    isLoading={markSentMutation.isPending}
                    onClick={() => markSentMutation.mutate(doc.id)}
                  >
                    {t("documents.widget.markSent")}
                  </Button>
                )}
                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noreferrer">
                    <Button size="small" variant="transparent">
                      <ArrowDownTray className="text-ui-fg-subtle" />
                      PDF
                    </Button>
                  </a>
                ) : (
                  <Text size="small" className="text-ui-fg-muted">
                    {t("documents.widget.rendering")}
                  </Text>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderDocumentsCardWidget
