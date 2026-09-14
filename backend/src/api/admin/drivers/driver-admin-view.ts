// Водитель, как его видит ПАНЕЛЬ продавца: тот же профиль, что уходит в
// приложение водителя, плюс имя того, кто закрыл заявку.
//
// Почему отдельный вид, а не поле в общем `DriverView`: решение по заявке —
// внутренняя кухня магазина, водителю в приложении оно не показывается. А
// наружу отдаём именно ИМЯ, а не `status_changed_by` (`usr_01H…`): id учётки
// на экране ничего не объясняет и является техническим мусором (идиома
// `admin/user-names.ts`, правило «ноль технических id на экране»).

import { IUserModuleService } from "@medusajs/framework/types"
import { DriverRecord } from "../../../modules/driver/types"
import { DriverView, toDriverView } from "../../driver/driver-view"
import { loadUserNames } from "../user-names"

export type AdminDriverView = DriverView & {
  status_changed_by_name: string | null
}

// Имена решивших по списку водителей — одним запросом на страницу очереди.
export const loadDriverDeciderNames = (
  userService: IUserModuleService,
  drivers: DriverRecord[]
): Promise<Map<string, string>> =>
  loadUserNames(userService, [
    ...new Set(
      drivers
        .map((driver) => driver.status_changed_by)
        .filter((id): id is string => !!id)
    ),
  ])

// Учётку могли удалить — тогда имени нет, и экран честно говорит «—», а не
// печатает id.
export const toAdminDriverView = (
  driver: DriverRecord,
  names: Map<string, string>
): AdminDriverView => ({
  ...toDriverView(driver),
  status_changed_by_name: driver.status_changed_by
    ? (names.get(driver.status_changed_by) ?? null)
    : null,
})
