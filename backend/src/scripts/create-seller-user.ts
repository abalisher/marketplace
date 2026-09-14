import { ExecArgs } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows"

// Ключ и значение роли продублированы из src/admin/lib/shell-role.ts намеренно:
// браузерный бандл админки и код бэкенда не импортируют друг друга.
const SHELL_ROLE_KEY = "role"
const SELLER_ROLE = "seller"

// Учётка обычного продавца для веб-панели (`/app`).
//
// В OSS-ядре Medusa v2 роли и права admin-пользователей отсутствуют: любой
// admin-пользователь технически всесилен. Роль нужна нам для ОБОЛОЧКИ панели —
// продавец не должен видеть настройки магазина, ключи API, регионы, налоги,
// акции и прайс-листы, которыми управляет владелец (см. src/admin/styles/shell.css
// и DECISIONS 2026-08-04). Признак роли храним в `user.metadata.role`:
// «seller» — обычный продавец, отсутствие значения или «owner» — владелец
// (поэтому существующая учётка админа продолжает видеть панель целиком).
//
// Запуск: npx medusa exec ./src/scripts/create-seller-user.ts
// Креды — из окружения (SELLER_EMAIL / SELLER_PASSWORD), по умолчанию dev-овские
// (см. .env.example). Скрипт идемпотентен: если пользователь уже есть, пароль не
// трогает, а только проставляет роль.
export default async function createSellerUser({ container }: ExecArgs) {
  const email = process.env.SELLER_EMAIL ?? "seller@stroymarket.kz"
  const password = process.env.SELLER_PASSWORD ?? "seller123456"

  const userService = container.resolve(Modules.USER)
  const authService = container.resolve(Modules.AUTH)

  const [existing] = await userService.listUsers({ email })
  if (existing) {
    await userService.updateUsers({
      id: existing.id,
      metadata: { ...(existing.metadata ?? {}), [SHELL_ROLE_KEY]: SELLER_ROLE },
    })
    console.log(
      `Пользователь ${email} уже существует — проставлена роль «${SELLER_ROLE}». ` +
        `Пароль не менялся.`
    )
    return
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
        first_name: "Продавец",
        metadata: { [SHELL_ROLE_KEY]: SELLER_ROLE },
      },
    },
  })

  // Страховка: если ядро не пронесёт metadata через workflow, проставим ролью
  // отдельным вызовом — без роли панель откроется в режиме владельца.
  if (user.metadata?.[SHELL_ROLE_KEY] !== SELLER_ROLE) {
    await userService.updateUsers({
      id: user.id,
      metadata: { ...(user.metadata ?? {}), [SHELL_ROLE_KEY]: SELLER_ROLE },
    })
  }

  console.log(
    `Учётка продавца создана: ${email} / ${password} (роль «${SELLER_ROLE}»). ` +
      `Вход — http://localhost:9000/app`
  )
}
