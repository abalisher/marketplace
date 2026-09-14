// Роли-группы сборщиков (T10.11). В OSS-ядре Medusa v2 прав у admin-пользователей
// нет — роль живёт в user.metadata (идиома src/scripts/create-seller-user.ts,
// ключ `role`): «picker» — сборщик. Его ГРУППА — handle категории каталога:
// сборщик видит только задания своей категории (группа = категория).
export const SHELL_ROLE_KEY = "role"
export const PICKER_ROLE = "picker"
export const ASSEMBLY_GROUP_KEY = "assembly_group"

export type PickerIdentity = {
  is_picker: boolean
  // handle категории (группа сборщика) или null, если группа не проставлена.
  group: string | null
}

// Разбор роли и группы из metadata admin-пользователя — чистая функция
// (тестируется юнитом, читается очередью заданий).
export function readPickerIdentity(
  metadata?: Record<string, unknown> | null
): PickerIdentity {
  const role = metadata?.[SHELL_ROLE_KEY]
  const group = metadata?.[ASSEMBLY_GROUP_KEY]
  return {
    is_picker: role === PICKER_ROLE,
    group: typeof group === "string" && group.trim() ? group.trim() : null,
  }
}
