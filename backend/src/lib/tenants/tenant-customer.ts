// Клиент компании, заведённый её менеджером в панели (POST
// /admin/tenant-customers): что сделать с покупателем площадки по номеру.
//
// Номер — ключ входа покупателя по SMS (T10.7): вход находит учётку по
// `phone` + `has_account`, поэтому новая карточка сразу «его», а чужую учётку
// панель не перезаписывает. Номер уже есть на площадке (человек покупал у
// другой компании) — привязываем молча и дописываем только пустое: имя, которое
// покупатель указал сам, менеджер не меняет, адресную книгу не трогаем, если в
// ней уже что-то есть. Ответ одинаков в обоих случаях, чтобы панель не
// выдавала, что человек уже покупал у других.

export type TenantCustomerInput = {
  tenant_id: string
  phone: string
  first_name: string
  last_name?: string
  address_1?: string
  city?: string
}

export type ExistingCustomer = {
  id: string
  first_name?: string | null
  last_name?: string | null
  address_count: number
  linked: boolean
}

export type TenantCustomerPlan = {
  // null — покупателя с этим номером нет, создаём.
  customer_id: string | null
  // Пустые поля существующего покупателя, которые заполняем.
  update: { first_name?: string; last_name?: string } | null
  add_address: boolean
  link: boolean
}

const clean = (value?: string | null) => (value ?? "").trim()

export const planTenantCustomer = (
  input: TenantCustomerInput,
  existing: ExistingCustomer | null
): TenantCustomerPlan => {
  const hasAddress = !!clean(input.address_1)
  if (!existing) {
    return { customer_id: null, update: null, add_address: hasAddress, link: true }
  }
  const update: { first_name?: string; last_name?: string } = {}
  if (!clean(existing.first_name) && clean(input.first_name)) {
    update.first_name = clean(input.first_name)
  }
  if (!clean(existing.last_name) && clean(input.last_name)) {
    update.last_name = clean(input.last_name)
  }
  return {
    customer_id: existing.id,
    update: Object.keys(update).length ? update : null,
    add_address: hasAddress && existing.address_count === 0,
    link: !existing.linked,
  }
}
