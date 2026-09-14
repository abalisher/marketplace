import { createReadStream, existsSync, statSync } from "fs"
import path from "path"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { storeOrigins } from "../../../lib/cors-origins"

// GET /media/:file — отдача файлов локального file-провайдера (фото товаров,
// PDF документов) С CORS-ЗАГОЛОВКАМИ. Ядро раздаёт тот же каталог по `/static`
// своей express.static-прослойкой: она отвечает раньше кастомных middleware,
// заголовков CORS не ставит, и web-сборка buyer (origin :3000) получала на каждую
// миниатюру «blocked by CORS policy» — фото не грузились (замечание владельца на
// приёмке 2026-08-11). `Image.network` во Flutter web ходит XHR и заголовков к
// запросу не добавляет, поэтому путь вне `/store/*`: там ядро требует
// publishable-ключ, а картинка его прислать не может (проверено: /store/* без
// ключа → 400).
//
// Отвечаем только знакомым origin'ам (тот же список, что у storeCors). В проде
// файлы уедут в S3/CDN (T8.4) — роут остаётся для локального провайдера.
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
}

// Имя файла — только «безопасные» символы: никаких `..`, слэшей и абсолютных
// путей (обход каталога отдал бы любой файл проекта).
const SAFE_NAME = /^[A-Za-z0-9._-]+$/

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const name = req.params.file

  if (!SAFE_NAME.test(name) || name.includes("..")) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }

  const extension = path.extname(name).toLowerCase()
  const contentType = CONTENT_TYPES[extension]
  if (!contentType) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }

  const filePath = path.join(process.cwd(), "static", name)
  if (!existsSync(filePath)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }
  const stat = statSync(filePath)
  if (!stat.isFile()) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }

  const origin = req.headers.origin
  if (origin && storeOrigins().includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
  }
  res.setHeader("Content-Type", contentType)
  res.setHeader("Content-Length", String(stat.size))
  res.setHeader("Cache-Control", "public, max-age=3600")

  createReadStream(filePath).pipe(res)
}
