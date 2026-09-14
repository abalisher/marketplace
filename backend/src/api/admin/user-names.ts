// Имена людей по id учёток для экранов панели: сборщик задания, кто закрыл
// отгрузку, кто перевёл статус заказа. Вместо `usr_01H…` в графе «Кто» —
// «Сборщик Отделочные материалы» или «Данияр Сеитов».
//
// Учётка без имени подписывается логином из почты (правило actorLabel):
// «picker.finishing@stroymarket.kz» → «picker.finishing». Домен в графе «Кто»
// ничего не добавляет, а строку удлиняет.
//
// Файл общий: тем же правилом подписаны и очередь отгрузки (T10.13), и лог
// переходов заказа (T4.12) — двух копий правила быть не должно.

import { IUserModuleService } from "@medusajs/framework/types"
import { actorLabel } from "./actor-label"

export const loadUserNames = async (
  userService: IUserModuleService,
  ids: string[]
): Promise<Map<string, string>> => {
  const names = new Map<string, string>()
  if (!ids.length) {
    return names
  }

  const users = await userService.listUsers(
    { id: ids },
    { select: ["id", "first_name", "last_name", "email"] }
  )
  for (const user of users) {
    const name = [user.first_name, user.last_name]
      .filter((part) => !!part?.trim())
      .join(" ")
      .trim()
    names.set(user.id, name || actorLabel(user.email) || user.email)
  }
  return names
}
