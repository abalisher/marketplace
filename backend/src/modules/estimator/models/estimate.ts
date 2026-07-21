import { model } from "@medusajs/framework/utils"
import EstimateLine from "./estimate-line"
import { ESTIMATE_SOURCES, ESTIMATE_STATUSES } from "./constants"

// Расчёт материалов (смета-потребность) покупателя. Результат РЕКОМЕНДАТЕЛЬНЫЙ
// (ТЗ 7) — покупатель правит позиции/количества. customer_id — опазная колонка
// (не FK; смета может быть и анонимной черновой). params — введённые вручную
// параметры (площадь/периметр/высота); file_id — исходный файл при source=file
// (ИИ-распознавание — отдельный этап). Итоги по сегментам считаются при расчёте.
const Estimate = model.define("estimate", {
  id: model.id({ prefix: "est" }).primaryKey(),
  customer_id: model.text().nullable(),
  source: model.enum([...ESTIMATE_SOURCES]).default("manual"),
  status: model.enum([...ESTIMATE_STATUSES]).default("draft"),
  // Введённые параметры (area/volume/length/height/count) — json.
  params: model.json().nullable(),
  // Исходный файл проекта (source=file); распознавание — отдельный этап.
  file_id: model.text().nullable(),
  note: model.text().nullable(),
  lines: model.hasMany(() => EstimateLine, { mappedBy: "estimate" }),
})

export default Estimate
