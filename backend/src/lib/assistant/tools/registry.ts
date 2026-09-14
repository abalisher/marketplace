import { isCompaniesEnabled } from "../../feature-flags"
import { AssistantTool } from "../types"
import { addToCartTool } from "./add-to-cart"
import { checkoutKaspiTool } from "./checkout-kaspi"
import { clearCartTool } from "./clear-cart"
import { estimateMaterialsTool } from "./estimate-materials"
import { getBuyerProfileTool } from "./get-buyer-profile"
import { getOrderDocumentsTool } from "./get-order-documents"
import { openDisputeTool } from "./open-dispute"
import { placeOrderTool } from "./place-order"
import { removeFromCartTool } from "./remove-from-cart"
import { requestAvrTool } from "./request-avr"
import { searchProductsTool } from "./search-products"
import { setDeliveryTool } from "./set-delivery"
import { trackOrderTool } from "./track-order"
import { updateCartItemTool } from "./update-cart-item"
import { viewCartTool } from "./view-cart"

// Реестр инструментов ассистента: плоский массив, по которому оркестратор
// собирает декларации для Gemini и находит исполнителя по имени вызова. Новые
// инструменты добавляются сюда по мере срезов пути покупателя.
export const ASSISTANT_TOOLS: AssistantTool[] = [
  searchProductsTool,
  estimateMaterialsTool,
  addToCartTool,
  viewCartTool,
  updateCartItemTool,
  removeFromCartTool,
  clearCartTool,
  getBuyerProfileTool,
  setDeliveryTool,
  checkoutKaspiTool,
  placeOrderTool,
  trackOrderTool,
  getOrderDocumentsTool,
  requestAvrTool,
  openDisputeTool,
]

// Инструменты юрлиц (T10.9). Пока FEATURE_COMPANIES выключен, магазин работает
// только с физлицами: такие инструменты модели не объявляются и по имени не
// находятся — вызвать их «по памяти» она не сможет, а не объявленный инструмент
// не даёт ей и повода заговорить про АВР и закрывающие документы юрлицу.
const COMPANY_ONLY_TOOLS = new Set(["request_avr"])

/** Инструменты, доступные ассистенту при текущих фича-флагах. */
export const getAssistantTools = (): AssistantTool[] =>
  isCompaniesEnabled()
    ? ASSISTANT_TOOLS
    : ASSISTANT_TOOLS.filter(
        (tool) => !COMPANY_ONLY_TOOLS.has(tool.declaration.name)
      )

export const findAssistantTool = (name: string): AssistantTool | undefined =>
  getAssistantTools().find((t) => t.declaration.name === name)
