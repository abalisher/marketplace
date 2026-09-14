import { z } from "@medusajs/framework/zod"
import { CATALOG_CATEGORIES } from "../../../lib/catalog/categories"
import { PRICE_STOCK_IMPORT_MAX_BASE64 } from "./import"
import {
  PRICE_STOCK_FILTERS,
  PRICE_STOCK_MAX_CHANGES,
  PRICE_STOCK_OTHER_CATEGORY,
} from "./rows"

// Срез экрана «Цены и остатки»: поиск по названию и артикулу, фильтр по одной
// из четырёх категорий (или «вне ассортимента»), чип остатка и пагинация.
export const AdminGetPriceStockParams = z.object({
  q: z.string().trim().max(120).optional(),
  // Ассортимент — ровно четыре категории; PRICE_STOCK_OTHER_CATEGORY — мешок
  // для всего остального (погашенная категория, её отсутствие): такие позиции
  // с экрана не убираем, но отфильтровать их должно быть чем.
  category: z
    .enum([
      PRICE_STOCK_OTHER_CATEGORY,
      ...CATALOG_CATEGORIES.map((category) => category.handle as string),
    ] as [string, ...string[]])
    .optional(),
  stock: z.enum(PRICE_STOCK_FILTERS).optional(),
  // Склад, который смотрит экран: остаток в строке — его. У магазина с одним
  // складом параметр не нужен, срез сам берёт единственный.
  location_id: z.string().min(1).optional(),
  // Черновики и отклонённые товары продавцу тоже нужны: цену назначают ДО
  // публикации. По умолчанию — все статусы.
  status: z.enum(["draft", "proposed", "published", "rejected"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetPriceStockParamsType = z.infer<
  typeof AdminGetPriceStockParams
>

// Одна правка: цена и/или остаток. Отсутствие поля — «не трогали»; null не
// принимаем, чтобы «сбросить цену» нельзя было сделать случайно.
// Цена — целые тенге (в каталоге дробных цен нет), остаток — целые единицы.
const PriceStockChange = z.object({
  variant_id: z.string().min(1),
  price: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  stock: z.coerce.number().int().min(0).max(10_000_000).optional(),
  location_id: z.string().min(1).optional(),
})

// Партия правок. Правка в строке — партия из одной позиции, массовая правка
// выделенных — до PRICE_STOCK_MAX_CHANGES.
export const AdminApplyPriceStock = z.object({
  changes: z.array(PriceStockChange).min(1).max(PRICE_STOCK_MAX_CHANGES),
  source: z.enum(["manual", "import"]).default("manual"),
})
export type AdminApplyPriceStockType = z.infer<typeof AdminApplyPriceStock>

// Выгрузка в файл — тот же срез, что на экране, только целиком: страниц у
// файла нет, поэтому limit и offset здесь не принимаем (T10.14c).
export const AdminExportPriceStockParams = AdminGetPriceStockParams.omit({
  limit: true,
  offset: true,
})
export type AdminExportPriceStockParamsType = z.infer<
  typeof AdminExportPriceStockParams
>

// Загрузка файла на предпросмотр. Содержимое идёт base64 в JSON (та же идиома,
// что у файлов ассистента): multipart ради одного экрана не заводим, а размер
// выгрузки всего каталога — десятки килобайт.
// location_id — разрез экрана: на него уедут остатки, если в файле нет своей
// колонки «Склад».
export const AdminImportPriceStock = z.object({
  file_name: z.string().trim().max(255).optional(),
  content_base64: z.string().min(1).max(PRICE_STOCK_IMPORT_MAX_BASE64),
  location_id: z.string().min(1).optional(),
})
export type AdminImportPriceStockType = z.infer<typeof AdminImportPriceStock>

// Журнал правок: весь или по одной позиции (для карточки товара — T11.6).
export const AdminGetPriceStockHistoryParams = z.object({
  variant_id: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type AdminGetPriceStockHistoryParamsType = z.infer<
  typeof AdminGetPriceStockHistoryParams
>
