import { InferTypeOf } from "@medusajs/framework/types"
import Driver from "./models/driver"

// Запись водителя как её отдаёт сервис модуля. Выведена из модели, чтобы
// шаги workflow и роуты `/driver/*` не переописывали поля руками.
export type DriverRecord = InferTypeOf<typeof Driver>
