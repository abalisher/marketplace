import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { CATALOG_MODULE } from ".."
import CatalogModuleService from "../service"
import ProductCard from "../models/product-card"

jest.setTimeout(120000)

// Интеграционный тест модуля: happy-path сервиса + инварианты из docs/modules/catalog.md.
// Раннер поднимает модуль на временной БД (см. .env.test).
moduleIntegrationTestRunner<CatalogModuleService>({
  moduleName: CATALOG_MODULE,
  moduleModels: [ProductCard],
  resolve: "./src/modules/catalog",
  testSuite: ({ service }) => {
    describe("CatalogModuleService", () => {
      it("creates a product card with segment and unit", async () => {
        const card = await service.createProductCards({
          segment: "economy",
          unit: "мешок 25 кг",
          // model.json() типизируется как Record, колонка хранит массив — как в create-company.
          certificates: [
            { name: "ГОСТ 31108-2020", url: "/files/cert.pdf" },
          ] as unknown as Record<string, unknown>,
        })

        expect(card.id).toMatch(/^pcard_/)
        expect(card.segment).toEqual("economy")
        expect(card.unit).toEqual("мешок 25 кг")
        expect(card.certificates).toEqual([
          { name: "ГОСТ 31108-2020", url: "/files/cert.pdf" },
        ])
        expect(card.rejection_reason).toBeNull()
      })

      it("rejects a segment outside the allowed enum", async () => {
        await expect(
          service.createProductCards({
            segment: "premium" as never,
            unit: "шт",
          })
        ).rejects.toThrow()
      })

      it("requires a reason to reject a card", async () => {
        const card = await service.createProductCards({
          segment: "comfort",
          unit: "шт",
        })

        await expect(
          service.setRejectionReason(card.id, "  ")
        ).rejects.toThrow("Rejection reason is required")

        const rejected = await service.setRejectionReason(
          card.id,
          "no certificates"
        )
        expect(rejected.rejection_reason).toEqual("no certificates")
      })

      it("clears the rejection reason on approval", async () => {
        const card = await service.createProductCards({
          segment: "business",
          unit: "м³",
        })
        await service.setRejectionReason(card.id, "wrong category")

        const cleared = await service.clearRejectionReason(card.id)

        expect(cleared.rejection_reason).toBeNull()
      })

      it("lists cards filtered by segment", async () => {
        await service.createProductCards([
          { segment: "economy", unit: "шт" },
          { segment: "economy", unit: "мешок" },
          { segment: "business", unit: "тонна" },
        ])

        const [economy, economyCount] =
          await service.listAndCountProductCards({ segment: "economy" })

        expect(economyCount).toEqual(2)
        expect(economy.every((c) => c.segment === "economy")).toBe(true)
      })
    })
  },
})
