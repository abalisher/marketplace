import { MedusaContainer } from "@medusajs/framework/types"
import { createEstimateWorkflow } from "../../../workflows/create-estimate"
import { AssistantTool } from "../types"

// Инструмент ассистента «расчёт материалов» (срез 2). Поглощает estimator в
// разговорный вход (пивот №3): покупатель описывает помещение/работу словами
// («комната 20 кв.м, потолки 3 м»), модель передаёт измерители — тонкая обёртка
// над существующим createEstimateWorkflow считает количества по активной
// нормативной базе. Логику НЕ дублируем (CLAUDE.md: инструмент вызывает workflow).
// Результат рекомендательный, ничего не персистит для клиента (идиома estimator:
// строка расчёта создаётся, но клиент её не хранит — stateless-ассистент).
// Названия материалов (material_kind) далее ищутся через search_products.

type Measures = {
  area?: number
  volume?: number
  length?: number
  height?: number
  count?: number
}

const MEASURE_KEYS = [
  "area",
  "volume",
  "length",
  "height",
  "count",
] as const

// Коерсинг измерителя из аргумента модели: число или числовая строка → конечное
// неотрицательное значение; иначе — пропуск (undefined). Отрицательные модель
// присылать не должна, но кламп к 0 отсекает случайный мусор.
const toMeasure = (raw: unknown): number | undefined => {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) {
    return undefined
  }
  return n
}

export const estimateMaterialsTool: AssistantTool = {
  declaration: {
    name: "estimate_materials",
    description:
      "Рассчитать количество черновых материалов по размерам помещения или " +
      "работы (площадь, объём, длина, высота, количество). Используй, когда " +
      "покупатель называет размеры вместо конкретного товара (например «комната " +
      "20 кв.м, потолки 3 метра» или «стяжка на 15 квадратов»). Возвращает список " +
      "материалов с рассчитанным количеством и единицей измерения. Названия " +
      "материалов затем можно найти в каталоге через search_products.",
    parameters: {
      type: "OBJECT",
      properties: {
        area: {
          type: "NUMBER",
          description: "Площадь в квадратных метрах (пол/стены/потолок).",
        },
        volume: {
          type: "NUMBER",
          description:
            "Объём в кубических метрах. Если не задан, но есть площадь и " +
            "высота — считается как площадь × высота.",
        },
        length: {
          type: "NUMBER",
          description: "Длина в метрах (для линейных работ).",
        },
        height: {
          type: "NUMBER",
          description: "Высота помещения в метрах.",
        },
        count: {
          type: "NUMBER",
          description: "Количество штук (для поштучных материалов).",
        },
      },
      required: [],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const params: Measures = {}
    for (const key of MEASURE_KEYS) {
      const value = toMeasure(args[key])
      if (value !== undefined) {
        params[key] = value
      }
    }

    // Без единого измерителя считать нечего — просим модель уточнить размеры,
    // а не гоняем пустой расчёт.
    if (Object.keys(params).length === 0) {
      return {
        lines: [],
        hint:
          "Не указаны размеры. Уточни у покупателя площадь, объём, длину, " +
          "высоту или количество.",
      }
    }

    const { result } = await createEstimateWorkflow(container).run({
      input: { customer_id: null, params },
      throwOnError: true,
    })

    const lines = (result.lines ?? []).map((line) => ({
      material_kind: line.material_kind,
      quantity: Number(line.quantity),
      unit: line.unit,
    }))

    return { lines }
  },
}
