import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"

// Выравнивание абсолютных ссылок на файлы под ТЕКУЩИЙ адрес стенда.
//
// Зачем. И фото товаров, и PDF документов хранятся в базе АБСОЛЮТНЫМИ ссылками:
// сид собирает их из `STATIC_BASE_URL` (`<база>/media/<файл>`), а файловый
// модуль пишет в `document.file_url` адрес вида `<база>/static/<файл>`
// (medusa-config.ts, `backend_url` локального провайдера). Поэтому смена адреса
// стенда правкой `.env` НЕДОСТАТОЧНА: строки в базе продолжают указывать на
// прежний origin, и покупатель получает битые фото и нескачиваемый счёт —
// причём молча, без единой ошибки в логе.
//
// Что делает: у каждого товара (`thumbnail`, `images[].url`) и каждого
// документа (`file_url`) заменяет origin ссылки на текущий `STATIC_BASE_URL`,
// сохраняя путь. Трогает ТОЛЬКО пути `/media/…` и `/static/…` — внешние ссылки
// (если однажды появятся) остаются как есть.
//
// Идемпотентен: ссылки, уже указывающие на нужный origin, не переписываются, и
// повторный прогон отчитывается нулями. Поэтому его безопасно держать шагом
// развёртывания — `deploy-server.sh` зовёт его после сидов.
//
// Запуск: npx medusa exec ./src/scripts/rebase-media-urls.ts
export default async function rebaseMediaUrls({ container }: ExecArgs) {
  const base = (process.env.STATIC_BASE_URL ?? "").replace(/\/+$/, "")
  if (!base) {
    throw new Error(
      "STATIC_BASE_URL не задан — не от чего считать адрес файлов"
    )
  }

  // Переносим только наши каталоги отдачи файлов. Всё остальное — чужие
  // ссылки, их перенаправлять на свой стенд нельзя.
  const OWNED_PREFIXES = ["/media/", "/static/"]

  // Возвращает исправленную ссылку либо null, если править нечего.
  const rebase = (raw: string | null | undefined): string | null => {
    if (!raw) {
      return null
    }
    let parsed: URL
    try {
      parsed = new URL(raw)
    } catch {
      // Относительная ссылка — она и так следует за origin страницы.
      return null
    }
    if (!OWNED_PREFIXES.some((p) => parsed.pathname.startsWith(p))) {
      return null
    }
    const next = `${base}${parsed.pathname}${parsed.search}`
    return next === raw ? null : next
  }

  const productService = container.resolve(Modules.PRODUCT)
  const documentsService: DocumentsModuleService =
    container.resolve(DOCUMENTS_MODULE)

  // --- Фото товаров. ---
  // Без `select`: в сочетании с `relations` он легко оставляет связанные
  // записи без нужных колонок, а экономия здесь всё равно незаметна.
  const products = await productService.listProducts({}, { relations: ["images"] })

  let productsTouched = 0
  for (const product of products) {
    const thumbnail = rebase(product.thumbnail)
    const images = (product.images ?? []).map((image) => ({
      url: rebase(image.url) ?? image.url,
    }))
    const imagesChanged = (product.images ?? []).some(
      (image, i) => images[i].url !== image.url
    )
    if (!thumbnail && !imagesChanged) {
      continue
    }
    await productService.updateProducts(product.id, {
      ...(thumbnail ? { thumbnail } : {}),
      // Набор изображений заменяется целиком — передаём все, включая
      // нетронутые, иначе уцелевшие фото пропали бы из карточки.
      ...(imagesChanged ? { images } : {}),
    })
    productsTouched++
    console.log(`~ фото: ${product.title}`)
  }

  // --- PDF документов (счёт, накладная, АВР). ---
  const documents = await documentsService.listDocuments({})

  let documentsTouched = 0
  for (const document of documents) {
    const fileUrl = rebase(document.file_url)
    if (!fileUrl) {
      continue
    }
    await documentsService.updateDocuments({ id: document.id, file_url: fileUrl })
    documentsTouched++
    console.log(`~ документ: ${document.number}`)
  }

  console.log(
    `Адрес файлов: ${base} · товаров исправлено: ${productsTouched} из ${products.length} · документов: ${documentsTouched} из ${documents.length}`
  )
}
