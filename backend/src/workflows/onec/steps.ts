import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"
import { ProductSegment } from "../../modules/catalog/models/product-card"
import { ONEC_MODULE } from "../../modules/onec"
import OnecModuleService from "../../modules/onec/service"
import { encryptSecret } from "../../lib/onec/secret"

// --- Карточки каталога товаров из 1С ---

export type CreateOnecProductCardsStepInput = {
  cards: { product_id: string; segment: ProductSegment; unit: string }[]
}

// Карточки каталога (сегмент, единица) для товаров, заведённых из 1С. Партией —
// у первой синхронизации их сотни. Компенсация удаляет созданные.
export const createOnecProductCardsStep = createStep(
  "create-onec-product-cards",
  async (input: CreateOnecProductCardsStepInput, { container }) => {
    if (!input.cards.length) {
      return new StepResponse([] as { product_id: string; product_card_id: string }[], [] as string[])
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const created = await service.createProductCards(
      input.cards.map((card) => ({ segment: card.segment, unit: card.unit }))
    )
    const pairs = input.cards.map((card, index) => ({
      product_id: card.product_id,
      product_card_id: created[index].id,
    }))
    return new StepResponse(
      pairs,
      created.map((card) => card.id)
    )
  },
  async (cardIds, { container }) => {
    if (!cardIds?.length) {
      return
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    await service.deleteProductCards(cardIds)
  }
)

export type UpdateOnecProductCardsStepInput = {
  cards: { product_card_id: string; unit: string }[]
}

// Единица измерения из 1С. Статус товара НЕ трогаем (в отличие от
// update-product-card): данные пришли из учёта компании, модерировать нечего.
export const updateOnecProductCardsStep = createStep(
  "update-onec-product-cards",
  async (input: UpdateOnecProductCardsStepInput, { container }) => {
    if (!input.cards.length) {
      return new StepResponse(undefined, [] as { id: string; unit: string }[])
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const previous = await service.listProductCards(
      { id: input.cards.map((card) => card.product_card_id) },
      { take: null }
    )
    await service.updateProductCards(
      input.cards.map((card) => ({ id: card.product_card_id, unit: card.unit }))
    )
    return new StepResponse(
      undefined,
      previous.map((card) => ({ id: card.id, unit: card.unit }))
    )
  },
  async (previous, { container }) => {
    if (!previous?.length) {
      return
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    await service.updateProductCards(previous)
  }
)

// --- Связь позиций 1С с товарами ---

export type CreateOnecItemsStepInput = {
  tenant_id: string
  items: {
    external_key: string
    external_code: string | null
    product_id: string
    variant_id: string
    cost: number | null
  }[]
}

export const createOnecItemsStep = createStep(
  "create-onec-items",
  async (input: CreateOnecItemsStepInput, { container }) => {
    if (!input.items.length) {
      return new StepResponse([] as string[], [] as string[])
    }
    const service = container.resolve<OnecModuleService>(ONEC_MODULE)
    const now = new Date()
    const created = await service.createOnecItems(
      input.items.map((item) => ({
        tenant_id: input.tenant_id,
        external_key: item.external_key,
        external_code: item.external_code,
        product_id: item.product_id,
        variant_id: item.variant_id,
        cost: item.cost,
        present: true,
        last_seen_at: now,
      }))
    )
    const ids = created.map((item) => item.id)
    return new StepResponse(ids, ids)
  },
  async (ids, { container }) => {
    if (!ids?.length) {
      return
    }
    const service = container.resolve<OnecModuleService>(ONEC_MODULE)
    await service.deleteOnecItems(ids)
  }
)

export type UpdateOnecItemsStepInput = {
  // present — позиция есть / пропала в 1С; cost — себестоимость из 1С. Не
  // переданное поле не трогаем.
  items: {
    id: string
    present?: boolean
    cost?: number | null
    external_code?: string | null
  }[]
}

type OnecItemSnapshot = {
  id: string
  present: boolean
  cost: number | null
  external_code: string | null
}

// Отметки позиций 1С: есть ли она в последнем ответе и её себестоимость.
// Компенсация возвращает прежние значения.
export const updateOnecItemsStep = createStep(
  "update-onec-items",
  async (input: UpdateOnecItemsStepInput, { container }) => {
    if (!input.items.length) {
      return new StepResponse(undefined, [] as OnecItemSnapshot[])
    }
    const service = container.resolve<OnecModuleService>(ONEC_MODULE)
    const previous = await service.listOnecItems(
      { id: input.items.map((item) => item.id) },
      { take: null }
    )
    const now = new Date()
    await service.updateOnecItems(
      input.items.map((item) => ({
        id: item.id,
        ...(item.present !== undefined ? { present: item.present } : {}),
        ...(item.present ? { last_seen_at: now } : {}),
        ...(item.cost !== undefined ? { cost: item.cost } : {}),
        ...(item.external_code !== undefined
          ? { external_code: item.external_code }
          : {}),
      }))
    )
    return new StepResponse(
      undefined,
      previous.map((item) => ({
        id: item.id,
        present: item.present,
        cost: item.cost == null ? null : Number(item.cost),
        external_code: item.external_code ?? null,
      }))
    )
  },
  async (previous, { container }) => {
    if (!previous?.length) {
      return
    }
    const service = container.resolve<OnecModuleService>(ONEC_MODULE)
    await service.updateOnecItems(previous)
  }
)

// --- Подключение ---

export type UpsertOnecConnectionStepInput = {
  tenant_id: string
  // http — HTTP-сервис 1С; file — каталог из Excel-файла (адрес, логин и
  // пароль не нужны).
  source?: "http" | "file"
  base_url?: string
  // Пустая строка или null — убрать второй сервис.
  stock_url?: string | null
  login?: string
  // Пустой/не переданный пароль — оставить сохранённый.
  password?: string | null
  enabled?: boolean
  interval_minutes?: number
  exclusive_catalog?: boolean
  stock_location_id?: string | null
}

type ConnectionSnapshot = {
  id: string
  source: "http" | "file"
  base_url: string | null
  stock_url: string | null
  login: string | null
  password_cipher: string | null
  enabled: boolean
  interval_minutes: number
  exclusive_catalog: boolean
  stock_location_id: string | null
}

export const upsertOnecConnectionStep = createStep(
  "upsert-onec-connection",
  async (input: UpsertOnecConnectionStepInput, { container }) => {
    const service = container.resolve<OnecModuleService>(ONEC_MODULE)
    const existing = await service.getConnectionByTenant(input.tenant_id)

    const fields = {
      ...(input.source !== undefined ? { source: input.source } : {}),
      ...(input.base_url !== undefined ? { base_url: input.base_url.trim() } : {}),
      ...(input.stock_url !== undefined
        ? { stock_url: input.stock_url?.trim() || null }
        : {}),
      ...(input.login !== undefined ? { login: input.login.trim() } : {}),
      ...(input.password ? { password_cipher: encryptSecret(input.password) } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.interval_minutes !== undefined
        ? { interval_minutes: input.interval_minutes }
        : {}),
      ...(input.exclusive_catalog !== undefined
        ? { exclusive_catalog: input.exclusive_catalog }
        : {}),
      ...(input.stock_location_id !== undefined
        ? { stock_location_id: input.stock_location_id }
        : {}),
    }

    const source = fields.source ?? existing?.source ?? "http"
    const hasService =
      !!(fields.base_url ?? existing?.base_url) &&
      !!(fields.login ?? existing?.login) &&
      !!(fields.password_cipher ?? existing?.password_cipher)
    if (source === "http" && !hasService) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Для подключения к 1С нужны адрес сервиса, логин и пароль"
      )
    }

    if (!existing) {
      const created = await service.createOnecConnections({
        tenant_id: input.tenant_id,
        ...fields,
        source,
        // Каталог из файла по расписанию не синхронизируется.
        ...(source === "file" ? { enabled: false } : {}),
      })
      return new StepResponse(created, { created_id: created.id } as {
        created_id?: string
        previous?: ConnectionSnapshot
      })
    }

    const previous: ConnectionSnapshot = {
      id: existing.id,
      source: existing.source,
      base_url: existing.base_url,
      stock_url: existing.stock_url,
      login: existing.login,
      password_cipher: existing.password_cipher,
      enabled: existing.enabled,
      interval_minutes: existing.interval_minutes,
      exclusive_catalog: existing.exclusive_catalog,
      stock_location_id: existing.stock_location_id,
    }
    const updated = await service.updateOnecConnections({
      id: existing.id,
      ...fields,
      ...(source === "file" ? { enabled: false } : {}),
    })
    return new StepResponse(updated, { previous } as {
      created_id?: string
      previous?: ConnectionSnapshot
    })
  },
  async (undo, { container }) => {
    if (!undo) {
      return
    }
    const service = container.resolve<OnecModuleService>(ONEC_MODULE)
    if (undo.created_id) {
      await service.deleteOnecConnections(undo.created_id)
    } else if (undo.previous) {
      await service.updateOnecConnections(undo.previous)
    }
  }
)
