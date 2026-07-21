// Имена событий домена документов (namespace document.* — не пересекается с
// ядровыми). Эмитятся из workflows выпуска (подзадача 2); подписчик-уведомление
// покупателю о новом документе — заглушка до notification-провайдера (идиома
// order-lifecycle/bonus).
export const DOCUMENT_ISSUED_EVENT = "document.issued"
