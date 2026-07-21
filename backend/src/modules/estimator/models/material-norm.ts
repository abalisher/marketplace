import { model } from "@medusajs/framework/utils"
import { NORM_BASES } from "./constants"

// Норматив расхода материала (АДМИНИСТРИРУЕМЫЙ справочник, ТЗ 7 — не хардкод):
// сколько материала нужно на единицу площади/объёма/длины/штуки по виду работ.
// work_type/material_kind — свободные строки (справочник ведёт админ); code —
// человекочитаемый ключ норматива. Привязка к SKU каталога — при расчёте
// (workflow, подзадача 2), не в норме: норма описывает вид материала, а не товар.
const MaterialNorm = model.define("material_norm", {
  id: model.id({ prefix: "norm" }).primaryKey(),
  code: model.text().unique(),
  name: model.text(),
  // Вид работ (напр. «стяжка пола», «кладка», «штукатурка») — строка справочника.
  work_type: model.text(),
  // Вид материала (напр. «цемент», «песок») — человекочитаемая метка позиции.
  material_kind: model.text(),
  // Категория каталога для подборки товаров (опазная ссылка на product_category
  // ядра, не FK). Норма указывает категорию; подборка берёт published-товары этой
  // категории по сегментам (решение маппинга material_kind↔каталог, 2026-07-21).
  // Пусто → подборки по норме нет (только количество).
  category_id: model.text().nullable(),
  // База расхода: area|volume|length|count.
  base: model.enum([...NORM_BASES]),
  // Расход материала на единицу базы (в ед. измерения unit).
  consumption_per_unit: model.number(),
  unit: model.text(),
  active: model.boolean().default(true),
  note: model.text().nullable(),
})

export default MaterialNorm
