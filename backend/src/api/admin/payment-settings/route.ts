import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ORDER_PAYMENT_MODULE } from "../../../modules/order-payment"
import OrderPaymentModuleService from "../../../modules/order-payment/service"
import { upsertPaymentSettingsWorkflow } from "../../../workflows/payments/upsert-payment-settings"
import { getTenantScope } from "../../utils/tenant-access"
import {
  listPaymentSellers,
  resolvePaymentSeller,
  serializePaymentSettings,
} from "./helpers"
import {
  AdminGetPaymentSettingsParamsType,
  AdminUpsertPaymentSettingsType,
} from "./validators"

// GET /admin/payment-settings — способы оплаты продавца. Сотрудник площадки без
// sales_channel_id получает список продавцов с их настройками — чтобы выбрать,
// чьи открыть.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { sales_channel_id } = req.validatedQuery as AdminGetPaymentSettingsParamsType
  const service = req.scope.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)

  if (!getTenantScope(req) && !sales_channel_id) {
    const sellers = await listPaymentSellers(req.scope)
    const rows = await service.listPaymentSettings({}, { take: null })
    const byChannel = new Map(rows.map((row) => [row.sales_channel_id, row]))
    res.json({
      sellers: sellers.map((seller) => ({
        ...seller,
        settings: serializePaymentSettings(
          (byChannel.get(seller.sales_channel_id) ?? null) as never
        ),
      })),
    })
    return
  }

  const seller = await resolvePaymentSeller(req, sales_channel_id)
  const row = await service.getSettingsByChannel(seller.sales_channel_id)
  res.json({ seller, settings: serializePaymentSettings(row as never) })
}

// POST /admin/payment-settings — сохранить способы оплаты продавца.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertPaymentSettingsType>,
  res: MedusaResponse
) {
  const { sales_channel_id, ...fields } = req.validatedBody
  const seller = await resolvePaymentSeller(req, sales_channel_id)
  const { result } = await upsertPaymentSettingsWorkflow(req.scope).run({
    input: { sales_channel_id: seller.sales_channel_id, ...fields },
    throwOnError: true,
  })
  res.json({ seller, settings: serializePaymentSettings(result as never) })
}
