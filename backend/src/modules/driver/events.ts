// События модуля водителя (namespace driver.*).

// Водитель зарегистрировался сам — продавцу прилетает заявка на проверку.
export const DRIVER_REGISTERED_EVENT = "driver.registered"
export type DriverRegisteredPayload = {
  driver_id: string
  phone: string
}

// Допуск водителя изменён продавцом: заявку приняли, отказали или заблокировали.
export const DRIVER_STATUS_CHANGED_EVENT = "driver.status_changed"
export type DriverStatusChangedPayload = {
  driver_id: string
  from: string
  to: string
  note: string | null
}
