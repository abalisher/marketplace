// Контакты лендинга — единственное место, где живёт номер горячей линии.
// Ссылки tel: и WhatsApp строятся отсюда, чтобы смена номера была правкой
// одной строки, а не поиском по всем секциям.
const PHONE_DIGITS = "77077126426"

export const LANDING_PHONE = {
  display: "+7 (707) 712-64-26",
  tel: `tel:+${PHONE_DIGITS}`,
}

// Ссылка wa.me с необязательным заготовленным текстом сообщения.
export const landingWhatsAppHref = (text?: string) =>
  `https://wa.me/${PHONE_DIGITS}${
    text ? `?text=${encodeURIComponent(text)}` : ""
  }`
