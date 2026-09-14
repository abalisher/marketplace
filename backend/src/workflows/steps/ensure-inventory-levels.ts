import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type InventoryLevelRef = {
  location_id: string
  inventory_item_id: string
}

export type EnsureInventoryLevelsStepInput = {
  levels: InventoryLevelRef[]
}

// Гарантировать, что у складской позиции есть уровень остатка на складе.
//
// Зачем: ядровый adjustInventoryLevelsStep умеет только МЕНЯТЬ существующий
// уровень и падает «Inventory level for item … and location … not found», если
// позиция на этом складе ещё не заводилась. Для приёмки это неверно по смыслу:
// первый приход товара на склад — норма, а не ошибка (Ф-прогон T4.6: закупщик не
// смог провести ни один приход). То же и у правки остатка в экране «Цены и
// остатки» (T10.14). Поэтому перед корректировкой создаём нулевые уровни для
// отсутствующих пар (позиция, склад).
//
// Пары, а не один склад: приход идёт на ОДИН склад, а партия правок экрана может
// задеть позиции на разных.
//
// Компенсация удаляет ТОЛЬКО те уровни, которые создал этот шаг: при откате
// workflow склад возвращается в исходное состояние, а уровни, что были до нас,
// не трогаем.
type EnsureInventoryLevelsOutput = { created: InventoryLevelRef[] }

const pairKey = (level: InventoryLevelRef) =>
  `${level.inventory_item_id}:${level.location_id}`

export const ensureInventoryLevelsStep = createStep(
  "ensure-inventory-levels",
  async (input: EnsureInventoryLevelsStepInput, { container }) => {
    const wanted = new Map<string, InventoryLevelRef>()
    for (const level of input.levels ?? []) {
      wanted.set(pairKey(level), level)
    }
    if (!wanted.size) {
      return new StepResponse<
        EnsureInventoryLevelsOutput,
        EnsureInventoryLevelsOutput
      >({ created: [] }, { created: [] })
    }

    const inventory = container.resolve(Modules.INVENTORY)
    const refs = [...wanted.values()]

    // Одной выборкой по всем позициям и складам партии: лишние пары в ответе
    // отсеиваются ключом (декартово произведение фильтров шире, чем спрошено).
    const existing = await inventory.listInventoryLevels({
      inventory_item_id: [...new Set(refs.map((r) => r.inventory_item_id))],
      location_id: [...new Set(refs.map((r) => r.location_id))],
    })
    const existingKeys = new Set(existing.map((level) => pairKey(level)))
    const missing = refs.filter((ref) => !existingKeys.has(pairKey(ref)))

    if (missing.length) {
      await inventory.createInventoryLevels(
        missing.map((ref) => ({
          inventory_item_id: ref.inventory_item_id,
          location_id: ref.location_id,
          stocked_quantity: 0,
        }))
      )
    }

    return new StepResponse<
      EnsureInventoryLevelsOutput,
      EnsureInventoryLevelsOutput
    >({ created: missing }, { created: missing })
  },
  async (compensation, { container }) => {
    if (!compensation?.created.length) {
      return
    }
    const inventory = container.resolve(Modules.INVENTORY)
    const created = new Set(compensation.created.map(pairKey))
    const levels = await inventory.listInventoryLevels({
      inventory_item_id: [
        ...new Set(compensation.created.map((ref) => ref.inventory_item_id)),
      ],
      location_id: [
        ...new Set(compensation.created.map((ref) => ref.location_id)),
      ],
    })
    const ids = levels
      .filter((level) => created.has(pairKey(level)))
      .map((level) => level.id)
    if (ids.length) {
      await inventory.deleteInventoryLevels(ids)
    }
  }
)
