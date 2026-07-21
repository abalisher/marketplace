import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"

jest.setTimeout(120000)

// HTTP-роуты admin API справочника нормативов (estimator 2b): список, upsert по
// code, удаление. Admin-only — контракт не трогали. Требует docker-postgres.
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

    const normBody = (over: Record<string, unknown> = {}) => ({
      code: "MN-CEM",
      name: "Цемент на стяжку",
      work_type: "screed",
      material_kind: "cement",
      base: "area",
      consumption_per_unit: 10,
      unit: "kg",
      ...over,
    })

    it("upserts a norm by code (create then update) and lists it", async () => {
      const created = await call(
        api.post("/admin/material-norms", normBody(), { headers: adminHeaders })
      )
      expect(created.status).toEqual(200)
      expect(created.data.material_norm.code).toEqual("MN-CEM")
      expect(created.data.material_norm.consumption_per_unit).toEqual(10)

      // Тот же code → обновление (не дубль).
      const updated = await call(
        api.post(
          "/admin/material-norms",
          normBody({ consumption_per_unit: 12 }),
          { headers: adminHeaders }
        )
      )
      expect(updated.status).toEqual(200)
      expect(updated.data.material_norm.consumption_per_unit).toEqual(12)

      const list = await call(
        api.get("/admin/material-norms", { headers: adminHeaders })
      )
      const cem = list.data.material_norms.filter(
        (n: { code: string }) => n.code === "MN-CEM"
      )
      expect(cem).toHaveLength(1)
      expect(cem[0].consumption_per_unit).toEqual(12)
    })

    it("rejects a non-positive consumption (400)", async () => {
      const res = await call(
        api.post(
          "/admin/material-norms",
          normBody({ code: "MN-BAD", consumption_per_unit: 0 }),
          { headers: adminHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })

    it("deletes a norm and 404s on unknown id", async () => {
      const created = await call(
        api.post("/admin/material-norms", normBody({ code: "MN-DEL" }), {
          headers: adminHeaders,
        })
      )
      const id = created.data.material_norm.id

      const del = await call(
        api.delete(`/admin/material-norms/${id}`, { headers: adminHeaders })
      )
      expect(del.status).toEqual(200)
      expect(del.data.deleted).toBe(true)

      const list = await call(
        api.get("/admin/material-norms", { headers: adminHeaders })
      )
      expect(
        list.data.material_norms.some((n: { id: string }) => n.id === id)
      ).toBe(false)

      const missing = await call(
        api.delete("/admin/material-norms/norm_missing", {
          headers: adminHeaders,
        })
      )
      expect(missing.status).toEqual(404)
    })
  },
})
