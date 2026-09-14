import { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  PickerIdentity,
  readPickerIdentity,
} from "../../../modules/assembly/roles"

// Кто пришёл в очередь заданий: обычный сотрудник панели (видит все задания)
// или сборщик (видит только задания своей группы = категории). Роль и группа
// живут в user.metadata — прав у admin-пользователей в OSS-ядре нет
// (см. modules/assembly/roles.ts и create-seller-user.ts).
export const resolveRequestPicker = async (
  req: AuthenticatedMedusaRequest
): Promise<PickerIdentity> => {
  const userId = req.auth_context?.actor_id
  if (!userId) {
    return { is_picker: false, group: null }
  }

  // Учётки может не быть (ключ API, удалённый пользователь) — тогда это не
  // сборщик, а полноценный сотрудник панели: фильтр по группе не навязываем.
  const userService = req.scope.resolve(Modules.USER)
  const [user] = await userService.listUsers({ id: userId }, { take: 1 })
  if (!user) {
    return { is_picker: false, group: null }
  }

  return readPickerIdentity(
    (user.metadata ?? null) as Record<string, unknown> | null
  )
}
