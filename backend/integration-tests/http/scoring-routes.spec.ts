import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"

jest.setTimeout(120000)

// HTTP-роуты admin API скоринга (подзадача 2a): настраиваемый конфиг +
// карточка рейтинга компании + ручная корректировка лимита. company_id — не FK
// (опазная колонка), поэтому реальная компания в тесте не нужна. Admin-only —
// контракт не трогали. Требует docker-postgres.
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>

    const call = async (promise: Promise<any>) =>
      promise.then(
        (res) => res,
        (err) => {
          if (!err.response) {
            throw err
          }
          return err.response
        }
      )

    beforeAll(async () => {
      container = getContainer()
      const email = "admin@example.com"
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container.resolve(Modules.USER).createUsers({ email })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: user.id },
      })
      const { data: login } = await api.post("/auth/user/emailpass", {
        email,
        password,
      })
      adminHeaders = { authorization: `Bearer ${login.token}` }
    })

    describe("/admin/scoring-config", () => {
      it("returns defaults and applies a partial update", async () => {
        const initial = await call(
          api.get("/admin/scoring-config", { headers: adminHeaders })
        )
        expect(initial.status).toEqual(200)
        expect(initial.data.scoring_config.id).toMatch(/^scoreconf_/)
        expect(initial.data.scoring_config.min_score_for_credit).toEqual(30)

        const updated = await call(
          api.post(
            "/admin/scoring-config",
            { min_score_for_credit: 40, limit_per_score_point: 6000 },
            { headers: adminHeaders }
          )
        )
        expect(updated.status).toEqual(200)
        expect(updated.data.scoring_config.min_score_for_credit).toEqual(40)
        expect(updated.data.scoring_config.limit_per_score_point).toEqual(6000)

        const reread = await call(
          api.get("/admin/scoring-config", { headers: adminHeaders })
        )
        expect(reread.data.scoring_config.min_score_for_credit).toEqual(40)
      })

      it("rejects an out-of-range score threshold (400)", async () => {
        const res = await call(
          api.post(
            "/admin/scoring-config",
            { min_score_for_credit: 150 },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
      })
    })

    describe("/admin/companies/:id/scorecard", () => {
      it("returns a zero scorecard for a company without scoring yet", async () => {
        const res = await call(
          api.get("/admin/companies/comp_none/scorecard", {
            headers: adminHeaders,
          })
        )
        expect(res.status).toEqual(200)
        expect(res.data.scorecard.exists).toBe(false)
        expect(res.data.scorecard.available_credit).toEqual(0)
      })

      it("sets and clears a manual credit limit reflected in available credit", async () => {
        const set = await call(
          api.post(
            "/admin/companies/comp_manual/scorecard/limit",
            { manual_limit: 1000000, note: "Approved by manager" },
            { headers: adminHeaders }
          )
        )
        expect(set.status).toEqual(200)
        expect(set.data.scorecard.exists).toBe(true)
        expect(set.data.scorecard.manual_limit).toEqual(1000000)
        expect(set.data.scorecard.available_credit).toEqual(1000000)

        // Сброс ручного лимита — вычисленного нет, свободный кредит 0.
        const cleared = await call(
          api.post(
            "/admin/companies/comp_manual/scorecard/limit",
            { manual_limit: null },
            { headers: adminHeaders }
          )
        )
        expect(cleared.data.scorecard.manual_limit).toBeNull()
        expect(cleared.data.scorecard.available_credit).toEqual(0)
      })

      it("rejects a negative manual limit (400)", async () => {
        const res = await call(
          api.post(
            "/admin/companies/comp_x/scorecard/limit",
            { manual_limit: -5 },
            { headers: adminHeaders }
          )
        )
        expect(res.status).toEqual(400)
      })
    })
  },
})
