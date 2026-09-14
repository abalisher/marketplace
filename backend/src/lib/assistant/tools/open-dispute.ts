import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"
import {
  DISPUTE_CATEGORIES,
  DisputeCategory,
} from "../../../modules/reviews/models/constants"
import { openDisputeWorkflow } from "../../../workflows/open-dispute"
import { AssistantContext, AssistantTool } from "../types"
import { DISPUTE_OUTCOME_TEXT, DISPUTE_STATUS_TEXT } from "./dispute-status"

// Инструмент ассистента «открыть претензию по заказу» (Ф-прогон 2026-08-13, М5:
// на «привезли бой», «вернуть можно?» и «куда жаловаться» ассистент отвечал
// «не знаю», и покупателю с оплаченным заказом идти было НЕКУДА). Модуль споров
// в системе есть, роут покупателя `POST /store/orders/:id/disputes` — тоже, но
// экрана претензии нет ни на витрине, ни в мобилке: после пивота единственный
// канал покупателя — диалог, поэтому претензию принимает ассистент.
//
// Логику НЕ дублируем: тонкая обёртка над openDisputeWorkflow (гейт
// принадлежности + блок второго активного диспута внутри сервиса). Претензия
// падает в раздел «Споры» панели продавца.
//
// БЕЗОПАСНОСТЬ (тот же гостевой флоу, что у track_order и request_avr): работаем
// ТОЛЬКО с заказом из `context.lastOrderId` — внутренний id случаен, владение им
// = право действовать по заказу (DECISIONS 2026-07-23). Покупателя берём из
// самого заказа: гость заказ оформить может, а логина у него нет вовсе, и
// требовать `context.customerId` значило бы закрыть претензию половине покупателей.

// Категория диспута → как её называет покупатель (описания уходят модели в
// декларацию инструмента: она выбирает категорию по словам покупателя).
const CATEGORY_HINTS: Record<DisputeCategory, string> = {
  not_delivered: "не привезли, не выдали, заказ не доехал",
  damaged: "повредили при доставке, бой, порвана упаковка",
  wrong_item: "привезли не то: другой товар, другая фасовка, не то количество",
  quality: "претензия к качеству самого товара",
  other: "иное, что не подходит под остальные категории",
}

// Минимум букв в описании: «брак» без подробностей не даёт оператору ничего,
// а покупателя лишний раз спросить дешевле, чем открыть пустую претензию.
const MIN_DESCRIPTION = 10
const MAX_DESCRIPTION = 1000

type OrderRow = {
  id: string
  display_id?: number | null
  customer_id?: string | null
}

type DisputeRow = {
  category: string
  status: string
  description: string
  resolution?: string | null
  outcome?: string | null
  created_at?: Date | string | null
}

// Претензия в том виде, в каком о ней можно говорить покупателю: без внутренних
// идентификаторов (промпт запрещает их показывать) — категория, статус словами
// и решение оператора, если оно уже есть.
const asBuyerFacing = (dispute: DisputeRow, displayId: number | null) => ({
  order_display_id: displayId,
  category: dispute.category,
  status: dispute.status,
  status_text: DISPUTE_STATUS_TEXT[dispute.status] ?? dispute.status,
  description: dispute.description,
  resolution: dispute.resolution ?? null,
  // Последствие решения (возврат/довоз/замена/бонусы) — покупателю его тоже
  // называем: канала уведомлений нет, чат единственный (DECISIONS 2026-08-18).
  outcome_text: dispute.outcome
    ? (DISPUTE_OUTCOME_TEXT[dispute.outcome] ?? null)
    : null,
  created_at: dispute.created_at ?? null,
})

export const openDisputeTool: AssistantTool = {
  declaration: {
    name: "open_dispute",
    description:
      "Открыть претензию по последнему оформленному заказу: не привезли, " +
      "привезли не то, бой/повреждение, вопрос к качеству. Претензию видит " +
      "магазин — она попадает в работу к оператору. Вызывай, когда покупатель " +
      "жалуется на заказ или спрашивает, куда обратиться с проблемой; сначала " +
      "уточни, ЧТО именно случилось, и передай это словами покупателя. " +
      "Если по заказу уже есть активная претензия — вернётся она же, вторая не " +
      "создаётся. Сроков рассмотрения и решения о возврате денег инструмент не " +
      "даёт — не обещай их покупателю.",
    parameters: {
      type: "OBJECT",
      properties: {
        category: {
          type: "STRING",
          description:
            "Категория проблемы: " +
            DISPUTE_CATEGORIES.map(
              (c) => `${c} — ${CATEGORY_HINTS[c]}`
            ).join("; ") +
            ".",
        },
        description: {
          type: "STRING",
          description:
            "Что случилось, словами покупателя: что именно, сколько, когда " +
            "обнаружили. Не пересказывай общими словами — оператор работает " +
            "по этому тексту.",
        },
      },
      required: ["category", "description"],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.lastOrderId) {
      return {
        error:
          "Нет заказа, по которому можно открыть претензию. Претензия " +
          "оформляется по оформленному заказу этого диалога.",
      }
    }

    const category = typeof args.category === "string" ? args.category : ""
    if (!DISPUTE_CATEGORIES.includes(category as DisputeCategory)) {
      return {
        error:
          `Неизвестная категория «${category}». Допустимые: ` +
          `${DISPUTE_CATEGORIES.join(", ")}.`,
      }
    }

    const description =
      typeof args.description === "string" ? args.description.trim() : ""
    if (description.length < MIN_DESCRIPTION) {
      return {
        error:
          "Слишком короткое описание. Спроси у покупателя, что именно " +
          "случилось (какой товар, сколько, когда обнаружили), и передай его " +
          "ответ сюда.",
      }
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "customer_id"],
      filters: { id: context.lastOrderId },
    })
    const order = (data as OrderRow[])[0]

    if (!order) {
      return { error: "Заказ не найден." }
    }
    if (!order.customer_id) {
      return {
        error:
          "По этому заказу претензию оформить нельзя: у него нет покупателя. " +
          "Скажи покупателю честно, что не можешь принять претензию по нему.",
      }
    }

    const displayId = order.display_id ?? null
    const reviewsService =
      container.resolve<ReviewsModuleService>(REVIEWS_MODULE)

    // Второй активный диспут сервис не пустит (ошибка NOT_ALLOWED). Читаем ДО
    // запуска workflow и отдаём существующую претензию как результат: для
    // покупателя «я же уже жаловался» — это вопрос о статусе, а не ошибка.
    const [active] = (await reviewsService.listDisputes(
      { order_id: order.id, status: ["open", "in_review"] },
      { take: 1 }
    )) as DisputeRow[]

    if (active) {
      return {
        dispute: asBuyerFacing(active, displayId),
        already_open: true,
        note:
          "По этому заказу претензия уже открыта — вторую не создаём. " +
          "Назови покупателю её статус и то, что он описал.",
      }
    }

    const { result } = await openDisputeWorkflow(container).run({
      input: {
        order_id: order.id,
        customer_id: order.customer_id,
        category: category as DisputeCategory,
        description: description.slice(0, MAX_DESCRIPTION),
      },
      throwOnError: true,
    })

    return {
      dispute: asBuyerFacing(result as unknown as DisputeRow, displayId),
      already_open: false,
      note:
        "Претензия принята и ушла в работу магазину. Сроков рассмотрения, " +
        "решения о возврате денег и замене товара ты не знаешь — не называй их.",
    }
  },
}
