import { model } from "@medusajs/framework/utils"
import { DRIVER_STATUSES } from "./constants"

// Водитель-gig: сам регистрируется по номеру телефона и сам заполняет профиль
// (T5.1). Номер в каноне +7XXXXXXXXXX — он же ключ учётной сущности в
// auth-модуле (provider `phone`, entity_id), поэтому уникален и здесь: две
// записи на один номер означали бы двух водителей на одну учётку.
// status_changed_by — user_id продавца, закрывшего заявку (опазная ссылка, не
// FK: ядровый user не импортируем; идиома assembly_task.assignee_id).
const Driver = model
  .define("driver", {
    id: model.id({ prefix: "drv" }).primaryKey(),
    phone: model.text(),
    full_name: model.text().nullable(),
    // Машина водителя: модель для пула заказов («Газель»), госномер для
    // пропуска на склад и сверки на выдаче.
    vehicle_model: model.text().nullable(),
    vehicle_plate: model.text().nullable(),
    // Грузоподъёмность, кг — по ней диспетчер/пул подбирает машину под заказ.
    capacity_kg: model.number().nullable(),
    status: model.enum([...DRIVER_STATUSES]).default("pending"),
    // Причина отказа/блокировки — её водитель видит у себя в приложении.
    status_note: model.text().nullable(),
    status_changed_at: model.dateTime().nullable(),
    status_changed_by: model.text().nullable(),
  })
  .indexes([
    {
      on: ["phone"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default Driver
