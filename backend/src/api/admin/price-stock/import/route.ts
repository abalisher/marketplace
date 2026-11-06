import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { decodeUploadedText } from "../csv"
import {
  PriceStockFileErrorCode,
  buildImportPreview,
  indexBySku,
  normalizeSku,
  readImportFile,
} from "../import"
import {
  PRICE_STOCK_SCAN_CAP,
  loadLocationNames,
  loadPriceStockProducts,
} from "../load"
import { PRICE_STOCK_MAX_CHANGES, isOnecManaged } from "../rows"
import { AdminImportPriceStockType } from "../validators"
import { getTenantScope } from "../../../utils/tenant-access"

// Отказ файлу целиком: ни одна строка не записана и предпросмотра нет.
// Сообщение — человеческое, код — для экрана (он подставляет свой текст и
// подсказку, что чинить).
const FILE_ERRORS: Record<PriceStockFileErrorCode, string> = {
  empty_file: "В файле нет строк с товарами",
  no_columns:
    "В файле не нашли колонок «Артикул» и «Цена» или «Остаток» — выгрузите образец и правьте его",
  too_many_rows: "В файле слишком много строк",
  mixed_locations: "В колонке «Склад» несколько разных складов",
  unknown_location: "Склад из файла не заведён",
  location_mismatch:
    "Файл выгружен по другому складу — выберите его сверху или уберите колонку «Склад»",
  too_many_changes: "Правок в файле больше, чем применяется за раз",
}

const fail = (
  res: MedusaResponse,
  code: PriceStockFileErrorCode,
  detail?: string
) => {
  res.status(400).json({
    message: detail ? `${FILE_ERRORS[code]}: ${detail}` : FILE_ERRORS[code],
    file_error: code,
  })
}

// POST /admin/price-stock/import — ПРЕДПРОСМОТР загруженного файла (T10.14c).
// Роут ничего не пишет: он говорит, что именно поменяется, и отдаёт готовую
// партию. Пишет её тот же `POST /admin/price-stock` с `source: "import"`,
// которым идёт правка в клетке — путь записи один, и партия по-прежнему
// применяется целиком либо не применяется вовсе.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { content_base64, location_id } =
    req.validatedBody as AdminImportPriceStockType

  const text = decodeUploadedText(Buffer.from(content_base64, "base64"))
  const file = readImportFile(text)
  if (file.error || !file.rows) {
    fail(res, file.error ?? "empty_file")
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  // Продавец компании загружает остатки только своих складов. Цены общих
  // товаров площадки у него закрыты — для них колонку цены файла не читаем
  // (пустая клетка = «не трогал»), иначе партия упала бы на price_locked
  // целиком. Цену своих товаров (из 1С компании) он задаёт и файлом.
  const tenant = getTenantScope(req)
  const locationNames = await loadLocationNames(
    query,
    tenant?.stock_location_ids
  )
  if (location_id && !locationNames.has(location_id)) {
    fail(res, "unknown_location")
    return
  }

  // Куда уедут остатки. Колонка «Склад» в файле — не украшение: выгрузка
  // сделана по одному складу, и если экран сейчас смотрит другой, числа уехали
  // бы не туда, а продавец бы этого не увидел. Поэтому склад из файла либо
  // совпадает с разрезом экрана, либо файл не принимается.
  const fileLocations = file.locations ?? []
  let scope: string | null = location_id ?? null
  if (fileLocations.length > 1) {
    fail(res, "mixed_locations", fileLocations.join(", "))
    return
  }
  if (fileLocations.length === 1) {
    const name = fileLocations[0].trim().toLowerCase()
    const match = [...locationNames.entries()].find(
      ([, value]) => value.trim().toLowerCase() === name
    )
    if (!match) {
      fail(res, "unknown_location", fileLocations[0])
      return
    }
    if (location_id && location_id !== match[0]) {
      fail(res, "location_mismatch", fileLocations[0])
      return
    }
    scope = match[0]
  }
  // Склад один — берём его молча (та же идиома, что у среза).
  if (!scope && locationNames.size === 1) {
    scope = [...locationNames.keys()][0]
  }

  // Файл ссылается на любые позиции каталога, а не на то, что видно на экране,
  // — поэтому читаем каталог целиком и сверяем по артикулу.
  const products = await loadPriceStockProducts(query, {
    sales_channel_id: tenant?.sales_channel_id,
  })
  const bySku = indexBySku(products)
  const fileRows = tenant
    ? file.rows.map((row) => {
        const target = bySku.get(normalizeSku(row.sku ?? ""))?.product
        return target && isOnecManaged(target) ? row : { ...row, price: "" }
      })
    : file.rows
  const preview = buildImportPreview(
    fileRows,
    bySku,
    scope,
    tenant?.stock_location_ids
  )

  if (preview.changes.length > PRICE_STOCK_MAX_CHANGES) {
    fail(res, "too_many_changes", String(preview.changes.length))
    return
  }

  res.json({
    ...preview,
    location_id: scope,
    location_name: scope ? locationNames.get(scope) ?? null : null,
    // Каталог упёрся в потолок просмотра: часть артикулов могла не попасть в
    // сверку, и «нет в каталоге» в такой выгрузке — не приговор.
    scan_capped: products.length >= PRICE_STOCK_SCAN_CAP,
  })
}
