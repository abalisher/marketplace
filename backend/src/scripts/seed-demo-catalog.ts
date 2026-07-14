import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductCardWorkflow } from "../workflows/create-product-card"
import { submitProductForModerationWorkflow } from "../workflows/submit-product-for-moderation"
import { rejectProductCardWorkflow } from "../workflows/reject-product-card"
import { ProductSegment } from "../modules/catalog/models/product-card"

// Сид демо-товаров с карточками каталога во всех статусах модерации — для
// ручной проверки очереди модерации и widget'а на странице товара.
// Запуск: npx medusa exec ./src/scripts/seed-demo-catalog.ts. Идемпотентен:
// уже посеянные товары (по названию) пропускаются, данные остаются в БД.
export default async function seedDemoCatalog({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const link = container.resolve("link")

  const [defaultChannel] = await salesChannelService.listSalesChannels(
    { name: "Default Sales Channel" },
    { take: 1 }
  )

  const demoProducts: {
    title: string
    segment: ProductSegment
    unit: string
    certificates: { name: string; url: string }[]
    // Целевой статус демо-товара: draft | proposed | rejected
    target: "draft" | "proposed" | "rejected"
  }[] = [
    {
      title: "Cement M400 50kg (demo)",
      segment: "economy",
      unit: "bag 50 kg",
      certificates: [{ name: "ГОСТ 31108-2020", url: "/files/cert-cement.pdf" }],
      target: "draft",
    },
    {
      title: "Brick M150 ceramic (demo)",
      segment: "comfort",
      unit: "pcs",
      certificates: [{ name: "ГОСТ 530-2012", url: "/files/cert-brick.pdf" }],
      target: "proposed",
    },
    {
      title: "Rebar A500C 12mm (demo)",
      segment: "business",
      unit: "ton",
      certificates: [{ name: "ГОСТ 34028-2016", url: "/files/cert-rebar.pdf" }],
      target: "rejected",
    },
  ]

  for (const demo of demoProducts) {
    const existing = await productService.listProducts(
      { title: demo.title },
      { take: 1 }
    )
    if (existing.length) {
      console.log(`— пропущен (уже есть): ${demo.title}`)
      continue
    }

    const product = await productService.createProducts({
      title: demo.title,
      status: ProductStatus.DRAFT,
      options: [{ title: "Packing", values: ["default"] }],
      variants: [
        {
          title: "default",
          sku: `DEMO-${demo.title.replace(/\W+/g, "-").toUpperCase()}`,
          options: { Packing: "default" },
        },
      ],
    })

    if (defaultChannel) {
      await link.create([
        {
          [Modules.PRODUCT]: { product_id: product.id },
          [Modules.SALES_CHANNEL]: { sales_channel_id: defaultChannel.id },
        },
      ])
    }

    await createProductCardWorkflow(container).run({
      input: {
        product_id: product.id,
        segment: demo.segment,
        unit: demo.unit,
        certificates: demo.certificates,
      },
      throwOnError: true,
    })

    if (demo.target === "proposed" || demo.target === "rejected") {
      await submitProductForModerationWorkflow(container).run({
        input: { product_id: product.id },
        throwOnError: true,
      })
    }
    if (demo.target === "rejected") {
      await rejectProductCardWorkflow(container).run({
        input: {
          product_id: product.id,
          reason: "Certificate is expired, please upload a valid one",
        },
        throwOnError: true,
      })
    }

    console.log(`+ создан: ${demo.title} → ${demo.target}`)
  }

  console.log("Демо-каталог посеян.")
}
