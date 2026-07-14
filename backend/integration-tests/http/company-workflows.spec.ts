import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { createCompanyWorkflow } from "../../src/workflows/create-company"
import { approveCompanyWorkflow } from "../../src/workflows/approve-company"
import { rejectCompanyWorkflow } from "../../src/workflows/reject-company"
import { createEmployeeWorkflow } from "../../src/workflows/create-employee"
import { deleteEmployeeWorkflow } from "../../src/workflows/delete-employee"
import { createSpendLimitWorkflow } from "../../src/workflows/create-spend-limit"
import { deleteSpendLimitWorkflow } from "../../src/workflows/delete-spend-limit"
import { COMPANY_MODULE } from "../../src/modules/company"
import CompanyModuleService from "../../src/modules/company/service"

jest.setTimeout(120000)

// Интеграционные тесты workflows модуля company: сквозные сценарии
// регистрации/модерации/сотрудников/лимитов на полном приложении
// (нужен docker-postgres; временная БД — см. backend/.env.test).
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    let container: MedusaContainer
    let customerSeq = 0

    // Регистрирует customer ядра — кандидата в сотрудники.
    const createCustomer = async () => {
      const customerService = container.resolve(Modules.CUSTOMER)
      customerSeq += 1
      return await customerService.createCustomers({
        email: `employee-${customerSeq}@example.com`,
        first_name: "Test",
        last_name: `Employee ${customerSeq}`,
      })
    }

    // Движок workflow сериализует ошибку шага в plain object (не instanceof
    // Error), поэтому expect(...).rejects.toThrow её не видит — проверяем
    // отклонение явным try/catch по message.
    const expectWorkflowError = async (
      run: PromiseLike<unknown>,
      substring: string
    ) => {
      let thrown: { message?: string } | null = null
      try {
        await run
      } catch (e) {
        thrown = e as { message?: string }
      }
      expect(thrown?.message).toContain(substring)
    }

    let binSeq = 0
    const registerCompany = async (customerId: string) => {
      binSeq += 1
      const { result } = await createCompanyWorkflow(container).run({
        input: {
          name: `TOO Stroyka ${binSeq}`,
          bin: String(100000000000 + binSeq),
          customer_id: customerId,
        },
      })
      return result
    }

    beforeAll(() => {
      container = getContainer()
    })

    describe("createCompanyWorkflow", () => {
      it("registers a pending company with the customer as admin employee", async () => {
        const customer = await createCustomer()

        const { company, employee } = await registerCompany(customer.id)

        expect(company.status).toEqual("pending")
        expect(employee.role).toEqual("admin")

        // Link employee ↔ customer виден через query.graph с обеих сторон.
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data } = await query.graph({
          entity: "customer",
          fields: ["id", "employee.id", "employee.company.id"],
          filters: { id: customer.id },
        })
        expect(data[0].employee?.id).toEqual(employee.id)
        expect(data[0].employee?.company?.id).toEqual(company.id)
      })

      it("rejects a malformed BIN and rolls the company back", async () => {
        const customer = await createCustomer()

        await expectWorkflowError(
          createCompanyWorkflow(container).run({
            input: {
              name: "Bad BIN",
              bin: "12345",
              customer_id: customer.id,
            },
            throwOnError: true,
          }),
          "BIN must be exactly 12 digits"
        )
      })

      it("rejects a customer that is already an employee", async () => {
        const customer = await createCustomer()
        await registerCompany(customer.id)

        await expectWorkflowError(
          createCompanyWorkflow(container).run({
            input: {
              name: "Second Company",
              bin: "999999999999",
              customer_id: customer.id,
            },
            throwOnError: true,
          }),
          "already an employee"
        )

        // Компенсация: компания-дубль не осталась в БД.
        const service =
          container.resolve<CompanyModuleService>(COMPANY_MODULE)
        const leftovers = await service.listCompanies({
          bin: "999999999999",
        })
        expect(leftovers).toHaveLength(0)
      })

      it("rejects an unknown customer", async () => {
        await expectWorkflowError(
          createCompanyWorkflow(container).run({
            input: {
              name: "Ghost",
              bin: "888888888888",
              customer_id: "cus_does_not_exist",
            },
            throwOnError: true,
          }),
          "not found"
        )
      })
    })

    describe("moderation workflows", () => {
      it("approves a company and clears the rejection reason", async () => {
        const customer = await createCustomer()
        const { company } = await registerCompany(customer.id)

        await rejectCompanyWorkflow(container).run({
          input: { id: company.id, reason: "no documents" },
        })
        const { result: approved } = await approveCompanyWorkflow(
          container
        ).run({ input: { id: company.id } })

        expect(approved.status).toEqual("approved")
        expect(approved.rejection_reason).toBeNull()
      })

      it("requires a reason to reject", async () => {
        const customer = await createCustomer()
        const { company } = await registerCompany(customer.id)

        await expectWorkflowError(
          rejectCompanyWorkflow(container).run({
            input: { id: company.id, reason: "  " },
            throwOnError: true,
          }),
          "Rejection reason is required"
        )
      })
    })

    describe("employee and spend limit workflows", () => {
      it("adds a member employee linked to a customer and sets a limit", async () => {
        const admin = await createCustomer()
        const { company } = await registerCompany(admin.id)
        const member = await createCustomer()

        const { result: employee } = await createEmployeeWorkflow(
          container
        ).run({
          input: { company_id: company.id, customer_id: member.id },
        })
        expect(employee.role).toEqual("member")

        const { result: spendLimit } = await createSpendLimitWorkflow(
          container
        ).run({
          input: {
            employee_id: employee.id,
            amount: 500_000,
            period: "month",
          },
        })
        expect(spendLimit.currency_code).toEqual("kzt")

        const service =
          container.resolve<CompanyModuleService>(COMPANY_MODULE)
        const loaded = await service.retrieveEmployee(employee.id, {
          relations: ["spend_limits"],
        })
        expect(loaded.spend_limits).toHaveLength(1)
      })

      it("rejects a non-positive spend limit", async () => {
        const admin = await createCustomer()
        const { company } = await registerCompany(admin.id)
        const member = await createCustomer()
        const { result: employee } = await createEmployeeWorkflow(
          container
        ).run({
          input: { company_id: company.id, customer_id: member.id },
        })

        await expectWorkflowError(
          createSpendLimitWorkflow(container).run({
            input: { employee_id: employee.id, amount: 0, period: "order" },
            throwOnError: true,
          }),
          "greater than 0"
        )
      })

      it("removes a spend limit", async () => {
        const admin = await createCustomer()
        const { company } = await registerCompany(admin.id)
        const member = await createCustomer()
        const { result: employee } = await createEmployeeWorkflow(
          container
        ).run({
          input: { company_id: company.id, customer_id: member.id },
        })
        const { result: spendLimit } = await createSpendLimitWorkflow(
          container
        ).run({
          input: { employee_id: employee.id, amount: 100_000, period: "day" },
        })

        await deleteSpendLimitWorkflow(container).run({
          input: { id: spendLimit.id },
        })

        const service =
          container.resolve<CompanyModuleService>(COMPANY_MODULE)
        const limits = await service.listSpendLimits({
          employee_id: employee.id,
        })
        expect(limits).toHaveLength(0)
      })

      it("deletes an employee with its limits and frees the customer", async () => {
        const admin = await createCustomer()
        const { company } = await registerCompany(admin.id)
        const member = await createCustomer()
        const { result: employee } = await createEmployeeWorkflow(
          container
        ).run({
          input: { company_id: company.id, customer_id: member.id },
        })
        await createSpendLimitWorkflow(container).run({
          input: { employee_id: employee.id, amount: 100_000, period: "week" },
        })

        await deleteEmployeeWorkflow(container).run({
          input: { id: employee.id },
        })

        const service =
          container.resolve<CompanyModuleService>(COMPANY_MODULE)
        const employees = await service.listEmployees({
          company_id: company.id,
        })
        expect(employees.map((e) => e.id)).not.toContain(employee.id)

        // Customer освободился — его можно привязать к другой компании.
        const { result: rehired } = await createEmployeeWorkflow(
          container
        ).run({
          input: { company_id: company.id, customer_id: member.id },
        })
        expect(rehired.id).not.toEqual(employee.id)
      })
    })
  },
})
