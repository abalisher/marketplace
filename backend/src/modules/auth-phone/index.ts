import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PhoneAuthProviderService from "./service"

// Идентификатор провайдера в auth-модуле: под ним лежат провайдер-идентичности
// (`provider = "phone"`, `entity_id` = номер в каноне +7XXXXXXXXXX).
export const PHONE_AUTH_PROVIDER = "phone"

// Регистрируется как ПРОВАЙДЕР ядрового модуля @medusajs/medusa/auth рядом с
// emailpass (учётки, заведённые по email, продолжают работать).
// Подключение — в medusa-config.ts, options.providers auth-модуля.
export default ModuleProvider(Modules.AUTH, {
  services: [PhoneAuthProviderService],
})
