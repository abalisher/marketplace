import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

// Чистка витринного каталога от не-доменных товаров (долг из STATE):
// 1) apparel-товары сида стартера Medusa — удаляются (заказов на них нет);
// 2) «Demo Order Product» из seed-demo-order.ts — НЕ удаляется (на нём демо-
//    заказы с резервами), а переводится в draft через СЕРВИС модуля product:
//    исчезает из витрины, событие product.updated не эмитится (карточки
//    модерации у него нет, но идиома та же, что в update-product-status).
// Идемпотентен: повторный запуск ничего не находит и выходит.
//
// Запуск: npx medusa exec ./src/scripts/cleanup-starter-catalog.ts
const STARTER_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"]
const DEMO_ORDER_PRODUCT_HANDLE = "demo-order-product"

export default async function cleanupStarterCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)

  const starterProducts = await productService.listProducts(
    { handle: STARTER_HANDLES },
    { select: ["id", "handle"] }
  )
  if (starterProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: starterProducts.map((p) => p.id) },
      throwOnError: true,
    })
    logger.info(
      `Deleted starter apparel products: ${starterProducts
        .map((p) => p.handle)
        .join(", ")}`
    )
  } else {
    logger.info("No starter apparel products found. Skipping.")
  }

  const [demoOrderProduct] = await productService.listProducts(
    { handle: DEMO_ORDER_PRODUCT_HANDLE, status: "published" },
    { select: ["id", "handle"] }
  )
  if (demoOrderProduct) {
    await productService.updateProducts(demoOrderProduct.id, {
      status: "draft",
    })
    logger.info(`Unpublished ${DEMO_ORDER_PRODUCT_HANDLE} (status=draft).`)
  } else {
    logger.info(`No published ${DEMO_ORDER_PRODUCT_HANDLE} found. Skipping.`)
  }
}
