import { ExecArgs } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows"
import { CATALOG_CATEGORIES } from "../lib/catalog/categories"
import {
  ASSEMBLY_GROUP_KEY,
  PICKER_ROLE,
  SHELL_ROLE_KEY,
} from "../modules/assembly/roles"

// Учётки сборщиков — по одной на группу, группа = категория каталога (T10.11,
// решение владельца 2026-08-25 п. 5: сборщики работают с телефона, у них нет
// компьютера). Прав у admin-пользователей в OSS-ядре Medusa v2 нет, поэтому
// роль и группа живут в user.metadata (идиома create-seller-user.ts):
// role=picker, assembly_group=<handle категории>. Очередь заданий
// GET /admin/assembly-tasks по этой группе и фильтрует выборку.
//
// Запуск: npx medusa exec ./src/scripts/create-picker-users.ts
// Пароль — из окружения (PICKER_PASSWORD), по умолчанию dev-овский.
// Скрипт идемпотентен: существующим учёткам пароль не меняет, только
// проставляет роль и группу.
export default async function createPickerUsers({ container }: ExecArgs) {
  const password = process.env.PICKER_PASSWORD ?? "picker123456"
  const userService = container.resolve(Modules.USER)
  const authService = container.resolve(Modules.AUTH)

  for (const category of CATALOG_CATEGORIES) {
    const email = `picker.${category.handle}@stroymarket.kz`
    const metadata = {
      [SHELL_ROLE_KEY]: PICKER_ROLE,
      [ASSEMBLY_GROUP_KEY]: category.handle,
    }

    const [existing] = await userService.listUsers({ email })
    if (existing) {
      await userService.updateUsers({
        id: existing.id,
        metadata: { ...(existing.metadata ?? {}), ...metadata },
      })
      console.log(
        `Сборщик ${email} уже существует — группа «${category.name}» проставлена. ` +
          `Пароль не менялся.`
      )
      continue
    }

    // Пароль живёт в auth-идентичности провайдера emailpass, а не в user.
    const registered = await authService.register("emailpass", {
      body: { email, password },
    })
    if (!registered.success || !registered.authIdentity) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Не удалось создать auth-идентичность для ${email}: ${registered.error}`
      )
    }

    const { result: user } = await createUserAccountWorkflow(container).run({
      input: {
        authIdentityId: registered.authIdentity.id,
        userData: {
          email,
          first_name: "Сборщик",
          last_name: category.name,
          metadata,
        },
      },
    })

    // Страховка: если ядро не пронесёт metadata через workflow — проставим
    // отдельным вызовом (без группы сборщик увидит пустую очередь).
    if (user.metadata?.[ASSEMBLY_GROUP_KEY] !== category.handle) {
      await userService.updateUsers({
        id: user.id,
        metadata: { ...(user.metadata ?? {}), ...metadata },
      })
    }

    console.log(
      `Учётка сборщика создана: ${email} / ${password} ` +
        `(группа «${category.name}», ${category.handle}).`
    )
  }
}
