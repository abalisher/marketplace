// Типы ответа dev-канала кодов входа покупателя (GET /admin/phone-otp-codes).
// Экран — routes/settings/login-codes; данные собирает бэкенд (T10.7).

export type AdminPhoneOtpCode = {
  /** Номер покупателя в каноне +7XXXXXXXXXX. */
  phone: string
  /** Код входа открытым текстом — только dev-канал стенда. */
  code: string
  requested_at: string | null
  expires_at: string
  /** Сколько раз уже ошиблись в этом коде. */
  attempts: number
}

export type AdminPhoneOtpCodesResponse = {
  /** false — dev-канал выключен (production): кодов в панели нет. */
  dev_channel: boolean
  codes: AdminPhoneOtpCode[]
}
