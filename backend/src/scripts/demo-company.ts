import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { COMPANY_MODULE } from "../modules/company"
import CompanyModuleService from "../modules/company/service"
import { createCompanyWorkflow } from "../workflows/create-company"
import { approveCompanyWorkflow } from "../workflows/approve-company"
import { rejectCompanyWorkflow } from "../workflows/reject-company"
import { createEmployeeWorkflow } from "../workflows/create-employee"
import { deleteEmployeeWorkflow } from "../workflows/delete-employee"
import { createSpendLimitWorkflow } from "../workflows/create-spend-limit"

// Временный демо-скрипт: полный жизненный цикл компании через workflows.
// Запуск: npx medusa exec ./src/scripts/demo-company.ts. В конце чистит за собой.
export default async function demoCompany({ container }: ExecArgs) {
  const log = (label: string, value?: unknown) =>
    console.log(`\n=== ${label} ===` + (value ? "\n" + JSON.stringify(value, null, 2) : ""))

  const customerService = container.resolve(Modules.CUSTOMER)
  const companyService = container.resolve<CompanyModuleService>(COMPANY_MODULE)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // 1. Директор регистрируется как обычный покупатель
  const director = await customerService.createCustomers({
    email: "director@stroyka.kz",
    first_name: "Айдос",
    last_name: "Директоров",
  })
  log("1. Customer (директор) создан", { id: director.id, email: director.email })

  // 2. Регистрирует юрлицо — сам становится сотрудником-админом
  const { result: reg } = await createCompanyWorkflow(container).run({
    input: {
      name: "ТОО СтройМастер",
      bin: "123456789012",
      documents: [{ name: "устав.pdf", url: "https://files.local/ustav.pdf" }],
      customer_id: director.id,
    },
  })
  log("2. Компания зарегистрирована (workflow create-company)", {
    company: { id: reg.company.id, name: reg.company.name, bin: reg.company.bin, status: reg.company.status },
    employee: { id: reg.employee.id, role: reg.employee.role },
  })

  // 3. Повторная регистрация тем же customer — отклоняется
  try {
    await createCompanyWorkflow(container).run({
      input: { name: "Дубль", bin: "222222222222", customer_id: director.id },
      throwOnError: true,
    })
  } catch (e) {
    log("3. Повторная регистрация отклонена", { error: (e as Error).message })
  }

  // 4. Модерация: сначала reject с комментарием, потом approve
  const { result: rejected } = await rejectCompanyWorkflow(container).run({
    input: { id: reg.company.id, reason: "Не приложена справка о госрегистрации" },
  })
  log("4a. Компания отклонена админом", {
    status: rejected.status,
    rejection_reason: rejected.rejection_reason,
  })

  const { result: approved } = await approveCompanyWorkflow(container).run({
    input: { id: reg.company.id },
  })
  log("4b. Компания одобрена админом", {
    status: approved.status,
    rejection_reason: approved.rejection_reason,
  })

  // 5. Админ компании добавляет сотрудника и назначает лимиты
  const manager = await customerService.createCustomers({
    email: "manager@stroyka.kz",
    first_name: "Мадина",
    last_name: "Менеджерова",
  })
  const { result: employee } = await createEmployeeWorkflow(container).run({
    input: { company_id: reg.company.id, customer_id: manager.id },
  })
  const { result: monthly } = await createSpendLimitWorkflow(container).run({
    input: { employee_id: employee.id, amount: 5_000_000, period: "month" },
  })
  const { result: perOrder } = await createSpendLimitWorkflow(container).run({
    input: { employee_id: employee.id, amount: 1_000_000, period: "order" },
  })
  log("5. Сотрудник добавлен, лимиты назначены", {
    employee: { id: employee.id, role: employee.role },
    limits: [
      { amount: monthly.amount, period: monthly.period, currency: monthly.currency_code },
      { amount: perOrder.amount, period: perOrder.period, currency: perOrder.currency_code },
    ],
  })

  // 6. Сквозной обход через link: от customer ядра к компании
  const { data } = await query.graph({
    entity: "customer",
    fields: ["email", "employee.role", "employee.company.name", "employee.company.status"],
    filters: { id: manager.id },
  })
  log("6. query.graph: customer → employee → company (через link)", data[0])

  // 7. Увольнение: link снят, лимиты удалены, customer остался
  await deleteEmployeeWorkflow(container).run({ input: { id: employee.id } })
  const { data: afterFire } = await query.graph({
    entity: "customer",
    fields: ["email", "employee.id"],
    filters: { id: manager.id },
  })
  log("7. Сотрудник уволен — customer остался, link снят", afterFire[0])

  // Чистка демо-данных: у админа сначала снимаем link (workflow), затем
  // жёсткое удаление строго снизу вверх (лимиты → сотрудники → компания) —
  // hard-delete родителя с мягко удалёнными детьми падает на каскаде.
  await deleteEmployeeWorkflow(container).run({ input: { id: reg.employee.id } })
  await companyService.deleteSpendLimits([monthly.id, perOrder.id])
  await companyService.deleteEmployees([reg.employee.id, employee.id])
  await companyService.deleteCompanies(reg.company.id)
  await customerService.deleteCustomers([director.id, manager.id])
  log("Демо-данные удалены")
}
