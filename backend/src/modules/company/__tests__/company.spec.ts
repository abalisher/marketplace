import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { COMPANY_MODULE } from ".."
import CompanyModuleService from "../service"
import Company from "../models/company"
import Employee from "../models/employee"
import SpendLimit from "../models/spend-limit"

jest.setTimeout(120000)

// Интеграционный тест модуля: happy-path сервиса + инварианты из docs/modules/company.md.
// Раннер поднимает модуль на временной БД (см. .env.test).
moduleIntegrationTestRunner<CompanyModuleService>({
  moduleName: COMPANY_MODULE,
  moduleModels: [Company, Employee, SpendLimit],
  resolve: "./src/modules/company",
  testSuite: ({ service }) => {
    describe("CompanyModuleService", () => {
      it("creates a company with pending moderation status by default", async () => {
        const company = await service.createCompanies({
          name: "TOO Stroyka",
          bin: "123456789012",
        })

        expect(company.id).toMatch(/^comp_/)
        expect(company.status).toEqual("pending")
        expect(company.rejection_reason).toBeNull()
      })

      it("rejects a duplicate BIN", async () => {
        await service.createCompanies({ name: "First", bin: "111111111111" })

        await expect(
          service.createCompanies({ name: "Second", bin: "111111111111" })
        ).rejects.toThrow()
      })

      it("approves a company and clears the rejection reason", async () => {
        const company = await service.createCompanies({
          name: "Approve Me",
          bin: "222222222222",
        })
        await service.rejectCompany(company.id, "no documents")

        const approved = await service.approveCompany(company.id)

        expect(approved.status).toEqual("approved")
        expect(approved.rejection_reason).toBeNull()
      })

      it("requires a reason to reject a company", async () => {
        const company = await service.createCompanies({
          name: "Reject Me",
          bin: "333333333333",
        })

        await expect(service.rejectCompany(company.id, "  ")).rejects.toThrow(
          "Rejection reason is required"
        )

        const rejected = await service.rejectCompany(company.id, "fake BIN")
        expect(rejected.status).toEqual("rejected")
        expect(rejected.rejection_reason).toEqual("fake BIN")
      })

      it("attaches employees with spend limits to a company", async () => {
        const company = await service.createCompanies({
          name: "With Staff",
          bin: "444444444444",
        })
        const admin = await service.createEmployees({
          company_id: company.id,
          role: "admin",
        })
        const member = await service.createEmployees({
          company_id: company.id,
        })
        await service.createSpendLimits({
          employee_id: member.id,
          amount: 500_000,
          period: "month",
        })

        expect(admin.role).toEqual("admin")
        expect(member.role).toEqual("member")

        const loaded = await service.retrieveCompany(company.id, {
          relations: ["employees", "employees.spend_limits"],
        })
        expect(loaded.employees).toHaveLength(2)

        const loadedMember = loaded.employees.find((e) => e.id === member.id)!
        expect(loadedMember.spend_limits).toHaveLength(1)
        expect(loadedMember.spend_limits[0].period).toEqual("month")
        expect(loadedMember.spend_limits[0].currency_code).toEqual("kzt")
      })
    })
  },
})
