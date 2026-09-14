import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { isCompaniesEnabled } from "../../feature-flags"
import { AssistantContext, AssistantTool } from "../types"
import {
  missingProfileFields,
  readBuyerIdentity,
  requireLogin,
} from "./buyer-identity"

// Инструмент ассистента «профиль покупателя». Только чтение. Отвечает на два
// вопроса шага оформления:
//  1. вошёл ли покупатель (T10.8: оформление доступно только вошедшему — гостю
//     кладём в ленту кнопку входа по номеру и говорим об этом модели);
//  2. что о нём УЖЕ известно — ФИО, телефон, адрес доставки: это ассистент не
//     переспрашивает, спрашивает только недостающее (`missing_fields`).
// Плюс шаг «Юр/Физ» — но ТОЛЬКО пока включён FEATURE_COMPANIES (T10.9). С
// выключенным флагом магазин работает с физлицами, и инструмент про компанию не
// говорит вовсе: ни статуса, ни подсказки «зарегистрируйте компанию» — иначе
// модель перескажет покупателю путь, которого в продукте нет.
// ВАЖНО (когда флаг включён): явно «выбирать»/персистить сущность не нужно —
// привязка заказа к компании автоматическая (resolveOrderCompanyStep выводит её
// из цепочки customer→employee→company при оформлении). Оформление от юрлица
// доступно только сотруднику ОДОБРЕННОЙ компании (модуль company).

type CompanyRow = {
  employee?: {
    company?: {
      id?: string
      name?: string
      status?: string
      rejection_reason?: string | null
    }
  }
}

export const getBuyerProfileTool: AssistantTool = {
  declaration: {
    name: "get_buyer_profile",
    description:
      "Узнать, вошёл ли покупатель и что о нём уже известно: имя, фамилия, " +
      "телефон, адрес доставки — эти данные НЕ переспрашивай, они подставятся " +
      "в оформление сами. Поле missing_fields перечисляет, чего не хватает: " +
      "спроси ровно это и один раз. Вызывай, когда доходишь до шага " +
      "оформления. Ничего не меняет.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: [],
    },
  },
  execute: async (
    container: MedusaContainer,
    _args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    // Гость: оформление ему недоступно (T10.8). Кнопку входа кладём в ленту
    // прямо отсюда — покупатель нажимает её и возвращается в тот же диалог.
    if (!context.customerId) {
      return {
        authenticated: false,
        entity_options: ["individual"],
        ...requireLogin(
          context,
          "Покупатель ещё не вошёл. Оформление заказа доступно только после " +
            "входа по номеру телефона — кнопка входа уже показана в чате. " +
            "Подбирать товары и считать он может и так."
        ),
      }
    }

    const identity = await readBuyerIdentity(container, context.customerId)
    if (!identity) {
      return {
        authenticated: false,
        entity_options: ["individual"],
        ...requireLogin(
          context,
          "Профиль покупателя прочитать не удалось — попроси его войти заново " +
            "по кнопке в чате."
        ),
      }
    }

    const profile = {
      phone: identity.phone || null,
      first_name: identity.first_name || identity.address?.first_name || null,
      last_name: identity.last_name || identity.address?.last_name || null,
      address: identity.address?.address_1
        ? {
            address_1: identity.address.address_1,
            city: identity.address.city,
          }
        : null,
    }
    const missing_fields = missingProfileFields(identity)

    // Юрлица заморожены (T10.9): дальше про компанию не смотрим и не отвечаем.
    if (!isCompaniesEnabled()) {
      return {
        authenticated: true,
        profile,
        missing_fields,
        entity_options: ["individual"],
      }
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "customer",
      fields: [
        "id",
        "employee.company.id",
        "employee.company.name",
        "employee.company.status",
        "employee.company.rejection_reason",
      ],
      filters: { id: context.customerId },
    })

    const company = (data as CompanyRow[])[0]?.employee?.company
    const isApproved = !!company?.id && company.status === "approved"

    // Юрлицо доступно только сотруднику ОДОБРЕННОЙ компании (лимиты/отсрочка
    // активны после модерации, docs/modules/company.md).
    if (isApproved) {
      return {
        authenticated: true,
        profile,
        missing_fields,
        entity_options: ["individual", "company"],
        company: { name: company!.name ?? "", status: company!.status },
      }
    }

    // Есть компания, но не одобрена — оформление на неё пока недоступно.
    if (company?.id) {
      return {
        authenticated: true,
        profile,
        missing_fields,
        entity_options: ["individual"],
        company: {
          name: company.name ?? "",
          status: company.status,
          rejection_reason: company.rejection_reason ?? null,
        },
        hint:
          "Компания покупателя ещё не прошла модерацию — оформление на " +
          "юрлицо станет доступно после одобрения. Сейчас доступно как физлицо. " +
          "Статус заявки и причина отказа видны покупателю в разделе " +
          "«Компания» его аккаунта.",
      }
    }

    return {
      authenticated: true,
      profile,
      missing_fields,
      entity_options: ["individual"],
      hint:
        "Покупатель не состоит в компании — доступно оформление как физлицо. " +
        "Компанию он регистрирует сам в разделе «Компания» своего аккаунта " +
        "(название, БИН, учредительные документы файлами), дальше модерация.",
    }
  },
}
