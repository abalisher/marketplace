import { XMarkMini } from "@medusajs/icons"
import {
  Button,
  Drawer,
  IconButton,
  Input,
  Label,
  Select,
  toast,
} from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminProductCard,
  AdminProductCardResponse,
  ProductCertificate,
  ProductSegment,
  SEGMENT_LABELS,
} from "../lib/catalog"
import { sdk } from "../lib/sdk"

type ProductCardDrawerProps = {
  productId: string
  // null — карточки ещё нет (режим создания)
  card: AdminProductCard | null
  open: boolean
  onClose: () => void
}

// Drawer создания/правки карточки каталога (сегмент, ед. изм., сертификаты) —
// идиома форм редактирования секций ядра. Сохранение — upsert-роут
// POST /admin/products/:id/product-card.
const ProductCardDrawer = ({
  productId,
  card,
  open,
  onClose,
}: ProductCardDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [segment, setSegment] = useState<ProductSegment | "">("")
  const [unit, setUnit] = useState("")
  const [certificates, setCertificates] = useState<ProductCertificate[]>([])

  // Форма заполняется текущими значениями при каждом открытии.
  useEffect(() => {
    if (open) {
      setSegment(card?.segment ?? "")
      setUnit(card?.unit ?? "")
      setCertificates(card?.certificates ?? [])
    }
  }, [open, card])

  const saveMutation = useMutation({
    mutationFn: (body: {
      segment: ProductSegment
      unit: string
      certificates: ProductCertificate[]
    }) =>
      sdk.client.fetch<AdminProductCardResponse>(
        `/admin/products/${productId}/product-card`,
        { method: "POST", body }
      ),
    onSuccess: () => {
      toast.success(
        t(
          card
            ? "productModeration.toast.cardUpdated"
            : "productModeration.toast.cardCreated"
        )
      )
      queryClient.invalidateQueries({ queryKey: ["catalog-moderation"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const setCertificate = (
    index: number,
    patch: Partial<ProductCertificate>
  ) => {
    setCertificates((prev) =>
      prev.map((cert, i) => (i === index ? { ...cert, ...patch } : cert))
    )
  }

  const canSave =
    !!segment &&
    !!unit.trim() &&
    certificates.every((cert) => cert.name.trim() && cert.url.trim())

  const save = () => {
    if (!segment) {
      return
    }
    saveMutation.mutate({
      segment,
      unit: unit.trim(),
      certificates: certificates.map((cert) => ({
        name: cert.name.trim(),
        url: cert.url.trim(),
      })),
    })
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            {t(
              card
                ? "productModeration.drawer.editTitle"
                : "productModeration.drawer.createTitle"
            )}
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="card-segment">
              {t("productModeration.drawer.segment")}
            </Label>
            <Select
              value={segment || undefined}
              onValueChange={(value) => setSegment(value as ProductSegment)}
            >
              <Select.Trigger id="card-segment">
                <Select.Value
                  placeholder={t("productModeration.drawer.selectSegment")}
                />
              </Select.Trigger>
              <Select.Content>
                {(
                  Object.entries(SEGMENT_LABELS) as [ProductSegment, string][]
                ).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {t(label)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="card-unit">
              {t("productModeration.drawer.unit")}
            </Label>
            <Input
              id="card-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder={t("productModeration.drawer.unitPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>{t("productModeration.drawer.certificates")}</Label>
            {certificates.map((cert, index) => (
              <div key={index} className="flex items-center gap-x-2">
                <Input
                  value={cert.name}
                  onChange={(event) =>
                    setCertificate(index, { name: event.target.value })
                  }
                  placeholder={t("productModeration.drawer.certName")}
                />
                <Input
                  value={cert.url}
                  onChange={(event) =>
                    setCertificate(index, { url: event.target.value })
                  }
                  placeholder={t("productModeration.drawer.certUrl")}
                />
                <IconButton
                  size="small"
                  variant="transparent"
                  type="button"
                  onClick={() =>
                    setCertificates((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  <XMarkMini />
                </IconButton>
              </div>
            ))}
            <Button
              size="small"
              variant="secondary"
              type="button"
              className="w-fit"
              onClick={() =>
                setCertificates((prev) => [...prev, { name: "", url: "" }])
              }
            >
              {t("productModeration.drawer.addCertificate")}
            </Button>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              {t("common.cancel")}
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            disabled={!canSave}
            isLoading={saveMutation.isPending}
            onClick={save}
          >
            {t("common.save")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default ProductCardDrawer
