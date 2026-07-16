import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { BONUS_MODULE } from ".."
import BonusModuleService, {
  assertSpendWithinCap,
  calculateOrderAccrual,
} from "../service"
import BonusAccount from "../models/bonus-account"
import BonusConfig from "../models/bonus-config"
import BonusTransaction from "../models/bonus-transaction"

jest.setTimeout(120000)

// Интеграционный тест модуля: лотовый леджер (credit/spend FIFO/revert/expire),
// конфиг-singleton и чистые функции начисления/потолка из docs/modules/bonus.md.
// Раннер поднимает модуль на временной БД (.env.test).
moduleIntegrationTestRunner<BonusModuleService>({
  moduleName: BONUS_MODULE,
  moduleModels: [BonusAccount, BonusTransaction, BonusConfig],
  resolve: "./src/modules/bonus",
  testSuite: ({ service }) => {
    describe("BonusModuleService", () => {
      it("creates an account with zero balance in KZT", async () => {
        const account = await service.createBonusAccounts({})

        expect(account.id).toMatch(/^bonacc_/)
        expect(Number(account.balance)).toEqual(0)
        expect(account.currency_code).toEqual("kzt")
      })

      it("creates the config singleton with defaults and reuses it", async () => {
        const config = await service.getOrCreateConfig()

        expect(config.id).toMatch(/^boncfg_/)
        expect(config.accrual_percent).toEqual(1)
        expect(config.max_spend_percent).toEqual(50)
        expect(config.expiry_days).toBeNull()
        expect(config.return_window_days).toEqual(14)

        // Повторный вызов возвращает ту же строку, а не плодит новые.
        const again = await service.getOrCreateConfig()
        expect(again.id).toEqual(config.id)
        const [, count] = await service.listAndCountBonusConfigs()
        expect(count).toEqual(1)
      })

      it("calculates accrual per item with segment overrides and floors the total", () => {
        // Платформенный процент без переопределений: 1% от 6000 = 60.
        expect(
          calculateOrderAccrual({
            items: [{ subtotal: 6000 }],
            accrual_percent: 1,
          })
        ).toEqual(60)

        // Сегментное переопределение действует только на свой сегмент.
        expect(
          calculateOrderAccrual({
            items: [
              { subtotal: 6000, segment: "business" },
              { subtotal: 3200, segment: "economy" },
            ],
            accrual_percent: 1,
            segment_percents: { business: 2 },
          })
        ).toEqual(152) // 6000×2% + 3200×1% = 120 + 32

        // Floor по сумме: 150×1% + 149×1% = 1.5 + 1.49 = 2.99 → 2.
        expect(
          calculateOrderAccrual({
            items: [{ subtotal: 150 }, { subtotal: 149 }],
            accrual_percent: 1,
          })
        ).toEqual(2)
      })

      it("enforces the spend cap as a share of the new order amount", () => {
        expect(() =>
          assertSpendWithinCap({
            spend_amount: 5000,
            order_amount: 10000,
            max_spend_percent: 50,
          })
        ).not.toThrow()
        expect(() =>
          assertSpendWithinCap({
            spend_amount: 5001,
            order_amount: 10000,
            max_spend_percent: 50,
          })
        ).toThrow("exceeds")
      })

      it("credits the account: creates a lot and raises the balance", async () => {
        const account = await service.createBonusAccounts({})

        const { account: updated, transaction } = await service.credit({
          account_id: account.id,
          amount: 100,
          expires_at: new Date("2026-12-31T00:00:00Z"),
          note: "order closed",
        })

        expect(Number(updated.balance)).toEqual(100)
        expect(transaction.type).toEqual("accrual")
        expect(Number(transaction.amount)).toEqual(100)
        expect(Number(transaction.remaining)).toEqual(100)
        expect(transaction.expires_at).toEqual(new Date("2026-12-31T00:00:00Z"))
      })

      it("rejects a non-positive credit and a debit type in credit()", async () => {
        const account = await service.createBonusAccounts({})

        await expect(
          service.credit({ account_id: account.id, amount: 0 })
        ).rejects.toThrow("positive")
        await expect(
          service.credit({
            account_id: account.id,
            amount: 10,
            type: "spend" as never,
          })
        ).rejects.toThrow("credit type")
      })

      it("spends FIFO from the lot expiring first and records the breakdown", async () => {
        const account = await service.createBonusAccounts({})
        // Лот без срока создан ПЕРВЫМ, но списание должно начаться с того,
        // что сгорает раньше.
        const { transaction: neverExpires } = await service.credit({
          account_id: account.id,
          amount: 100,
        })
        const { transaction: expiresSoon } = await service.credit({
          account_id: account.id,
          amount: 50,
          expires_at: new Date("2026-08-01T00:00:00Z"),
        })

        const { account: updated, transaction: spend } = await service.spend({
          account_id: account.id,
          amount: 70,
        })

        expect(Number(updated.balance)).toEqual(80)
        expect(spend.type).toEqual("spend")
        expect(spend.lot_breakdown).toEqual([
          { transaction_id: expiresSoon.id, taken: 50 },
          { transaction_id: neverExpires.id, taken: 20 },
        ])
        const soonAfter = await service.retrieveBonusTransaction(
          expiresSoon.id
        )
        const neverAfter = await service.retrieveBonusTransaction(
          neverExpires.id
        )
        expect(Number(soonAfter.remaining)).toEqual(0)
        expect(Number(neverAfter.remaining)).toEqual(80)
      })

      it("refuses to overspend the balance (no side effects)", async () => {
        const account = await service.createBonusAccounts({})
        await service.credit({ account_id: account.id, amount: 30 })

        await expect(
          service.spend({ account_id: account.id, amount: 31 })
        ).rejects.toThrow("Insufficient")

        const after = await service.retrieveBonusAccount(account.id)
        expect(Number(after.balance)).toEqual(30)
        const [, count] = await service.listAndCountBonusTransactions({
          account_id: account.id,
          type: "spend",
        })
        expect(count).toEqual(0)
      })

      it("reverts a spend: restores lots, balance and removes the transaction", async () => {
        const account = await service.createBonusAccounts({})
        const { transaction: lot } = await service.credit({
          account_id: account.id,
          amount: 100,
        })
        const { transaction: spend } = await service.spend({
          account_id: account.id,
          amount: 40,
        })

        const { account: reverted } = await service.revertSpend({
          spend_transaction_id: spend.id,
        })

        expect(Number(reverted.balance)).toEqual(100)
        const lotAfter = await service.retrieveBonusTransaction(lot.id)
        expect(Number(lotAfter.remaining)).toEqual(100)
        await expect(
          service.retrieveBonusTransaction(spend.id)
        ).rejects.toThrow()
      })

      it("expires only the unspent remainder of overdue lots, idempotently", async () => {
        const account = await service.createBonusAccounts({})
        // Просроченный лот, частично потраченный: сгореть должен остаток 60.
        await service.credit({
          account_id: account.id,
          amount: 100,
          expires_at: new Date("2026-07-01T00:00:00Z"),
        })
        await service.spend({ account_id: account.id, amount: 40 })
        // Живой лот — не трогаем.
        await service.credit({
          account_id: account.id,
          amount: 25,
          expires_at: new Date("2027-01-01T00:00:00Z"),
        })

        const results = await service.expireLots({
          now: new Date("2026-07-16T00:00:00Z"),
        })

        expect(results).toHaveLength(1)
        expect(results[0].account_id).toEqual(account.id)
        expect(results[0].amount).toEqual(60)
        const after = await service.retrieveBonusAccount(account.id)
        expect(Number(after.balance)).toEqual(25)
        const [expiries] = await service.listAndCountBonusTransactions({
          account_id: account.id,
          type: "expiry",
        })
        expect(expiries).toHaveLength(1)
        expect(Number(expiries[0].amount)).toEqual(60)

        // Идемпотентность: повторный вызов ничего не находит.
        const again = await service.expireLots({
          now: new Date("2026-07-16T00:00:00Z"),
        })
        expect(again).toHaveLength(0)
      })
    })
  },
})
