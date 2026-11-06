import { MedusaContainer } from "@medusajs/framework/types"
import { AssistantContext, AssistantTool } from "../types"
import {
  deliveryFormAttachment,
  dropDeliveryForm,
  missingProfileFields,
  readBuyerIdentity,
  requireLogin,
  saveBuyerProfile,
} from "./buyer-identity"

const str = (raw: unknown): string =>
  typeof raw === "string" ? raw.trim() : ""

// Инструмент «сохранить данные покупателя»: имя, фамилия, адрес — сразу, как
// только покупатель их назвал (даже по частям), чтобы при обрыве диалога ничего
// не пришлось спрашивать заново. Только профиль: адрес на корзину и способ
// доставки ставит set_delivery, когда покупатель готов оформлять.
export const saveBuyerProfileTool: AssistantTool = {
  declaration: {
    name: "save_buyer_profile",
    description:
      "Сохранить в профиль покупателя имя, фамилию и/или адрес доставки, как " +
      "только он их назвал — можно по частям (например, только имя). Корзину " +
      "не меняет: адрес на заказ ставит set_delivery. Требует входа: гостю " +
      "вернёт login_required. Возвращает сохранённый профиль и поля, которых " +
      "ещё не хватает для оформления.",
    parameters: {
      type: "OBJECT",
      properties: {
        first_name: { type: "STRING", description: "Имя покупателя." },
        last_name: { type: "STRING", description: "Фамилия покупателя." },
        phone: {
          type: "STRING",
          description:
            "Контактный телефон получателя для курьера (опц.). Номер, по " +
            "которому покупатель входит, этим не меняется.",
        },
        address_1: {
          type: "STRING",
          description: "Улица, дом, квартира/офис, подъезд.",
        },
        city: {
          type: "STRING",
          description:
            "Город (опц.). Не спрашивай — по умолчанию Астана; передавай, " +
            "только если покупатель сам назвал другой город.",
        },
        postal_code: { type: "STRING", description: "Почтовый индекс (опц.)." },
      },
      required: [],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.customerId) {
      return requireLogin(
        context,
        "Сохранить данные можно после входа по номеру телефона — кнопка входа " +
          "уже показана покупателю в чате."
      )
    }

    const identity = await readBuyerIdentity(container, context.customerId)
    if (!identity) {
      return requireLogin(
        context,
        "Не удалось прочитать профиль покупателя — попроси его войти заново " +
          "по кнопке в чате."
      )
    }

    const saved = await saveBuyerProfile(container, identity, {
      first_name: str(args.first_name),
      last_name: str(args.last_name),
      phone: str(args.phone),
      address_1: str(args.address_1),
      city: str(args.city),
      postal_code: str(args.postal_code),
    })

    const missing = missingProfileFields(saved)
    if (missing.length) {
      context.attachments?.push(
        deliveryFormAttachment(
          {
            first_name: saved.first_name || saved.address?.first_name,
            last_name: saved.last_name || saved.address?.last_name,
            phone: saved.phone || saved.address?.phone,
            address_1: saved.address?.address_1,
            city: saved.address?.city,
          },
          missing
        )
      )
    } else {
      dropDeliveryForm(context)
    }

    return {
      saved: true,
      profile: {
        first_name: saved.first_name || null,
        last_name: saved.last_name || null,
        address: saved.address
          ? { address_1: saved.address.address_1, city: saved.address.city }
          : null,
      },
      missing_fields: missing,
    }
  },
}
