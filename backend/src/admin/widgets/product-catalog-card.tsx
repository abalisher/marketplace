import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpCircleSolid,
  CheckCircleSolid,
  EllipsisHorizontal,
  PencilSquare,
  XCircleSolid,
} from "@medusajs/icons"
import {
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import ProductCardDrawer from "../components/product-card-drawer"
import RejectProductCardPrompt from "../components/reject-product-card-prompt"
import { useProductModeration } from "../hooks/use-product-moderation"
import {
  AdminProductWithCardResponse,
  SEGMENT_LABELS,
} from "../lib/catalog"
import { sdk } from "../lib/sdk"

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

// Widget кастомной части карточки каталога на ядровой странице товара:
// сегмент, ед. изм., сертификаты, комментарий отклонения + действия
// (создать/править карточку, submit/approve/reject) в «...»-меню секции.
// Статус и данные карточки берутся своим запросом: prop `data` ядра не
// включает поля link'а и не обновляется после наших мутаций.
const ProductCatalogCardWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const { submitMutation, approveMutation, rejectMutation, approveWithConfirm } =
    useProductModeration()
  const [editOpen, setEditOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const { data: detail, isLoading } = useQuery({
    queryKey: ["catalog-moderation", "card", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminProductWithCardResponse>(
        `/admin/products/${data.id}`,
        { query: { fields: "id,status,*product_card" } }
      ),
  })

  const card = detail?.product.product_card ?? null
  const status = detail?.product.status
  const certificates = card?.certificates ?? []
  const actionsPending =
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Catalog card</Heading>
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
              disabled={isLoading}
            >
              <PencilSquare className="text-ui-fg-subtle" />
              {card ? "Edit" : "Create"}
            </DropdownMenu.Item>
            {card && (status === "draft" || status === "rejected") && (
              <DropdownMenu.Item
                className="gap-x-2"
                onClick={() => submitMutation.mutate(data.id)}
                disabled={actionsPending}
              >
                <ArrowUpCircleSolid className="text-ui-fg-subtle" />
                Submit for moderation
              </DropdownMenu.Item>
            )}
            {status === "proposed" && (
              <DropdownMenu.Item
                className="gap-x-2"
                onClick={() =>
                  approveWithConfirm({ id: data.id, title: data.title })
                }
                disabled={actionsPending}
              >
                <CheckCircleSolid className="text-ui-fg-subtle" />
                Approve
              </DropdownMenu.Item>
            )}
            {status === "proposed" && (
              <DropdownMenu.Item
                className="gap-x-2"
                onClick={() => setRejectOpen(true)}
                disabled={actionsPending}
              >
                <XCircleSolid className="text-ui-fg-subtle" />
                Reject
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      {card ? (
        <>
          <CardRow label="Segment">{SEGMENT_LABELS[card.segment]}</CardRow>
          <CardRow label="Unit">{card.unit}</CardRow>
          <CardRow label="Certificates">
            {certificates.length ? (
              <span className="flex flex-col gap-y-1">
                {certificates.map((cert) => (
                  <a
                    key={cert.url}
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover w-fit"
                  >
                    {cert.name}
                  </a>
                ))}
              </span>
            ) : (
              "—"
            )}
          </CardRow>
          {status === "rejected" && card.rejection_reason && (
            <CardRow label="Rejection reason">{card.rejection_reason}</CardRow>
          )}
        </>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading
              ? "Loading…"
              : "No catalog card yet. Create one with a segment and unit so the product can be submitted for moderation."}
          </Text>
        </div>
      )}

      <ProductCardDrawer
        productId={data.id}
        card={card}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <RejectProductCardPrompt
        product={rejectOpen ? { id: data.id, title: data.title } : null}
        onClose={() => setRejectOpen(false)}
        onSubmit={(id, reason) =>
          rejectMutation.mutate(
            { id, reason },
            { onSuccess: () => setRejectOpen(false) }
          )
        }
        isPending={rejectMutation.isPending}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductCatalogCardWidget
