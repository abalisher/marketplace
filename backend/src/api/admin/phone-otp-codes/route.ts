import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PHONE_AUTH_PROVIDER } from "../../../modules/auth-phone"
import { resolvePhoneOtpConfig } from "../../../modules/auth-phone/config"
import { PhoneOtpState } from "../../../modules/auth-phone/otp"

const LIMIT = 20

// GET /admin/phone-otp-codes — dev-канал доставки кода входа покупателя
// (T10.7): SMS-провайдера на MVP нет, поэтому на стенде код видно в панели.
// Открытым текстом код лежит в provider_metadata только при включённом
// dev-канале; в production ответ приходит с dev_channel=false и пустым списком.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const config = resolvePhoneOtpConfig()
  if (!config.devChannel) {
    res.json({ dev_channel: false, codes: [] })
    return
  }

  const authService = req.scope.resolve(Modules.AUTH)
  const identities = await authService.listProviderIdentities(
    { provider: PHONE_AUTH_PROVIDER },
    { take: 200, order: { updated_at: "DESC" } }
  )

  const now = Date.now()
  const codes = identities
    .map((identity) => ({
      phone: identity.entity_id,
      state: (identity.provider_metadata ?? {}) as PhoneOtpState,
    }))
    .filter(
      ({ state }) =>
        !!state.dev_code &&
        !!state.code_expires_at &&
        Date.parse(state.code_expires_at) > now
    )
    .map(({ phone, state }) => ({
      phone,
      code: state.dev_code as string,
      requested_at: state.code_requested_at ?? null,
      expires_at: state.code_expires_at as string,
      attempts: state.attempts ?? 0,
    }))
    .sort((a, b) => (a.requested_at ?? "") < (b.requested_at ?? "") ? 1 : -1)
    .slice(0, LIMIT)

  res.json({ dev_channel: true, codes })
}
