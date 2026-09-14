// DTO ответов admin-API компаний (backend/src/api/admin/companies/**) и
// метаданные статусов для экранов модерации. Статусы продублированы из модели
// намеренно: код модуля нельзя импортировать в браузерный бандл админки.

export type CompanyStatus = "pending" | "approved" | "rejected"

export type CompanyDocument = {
  name: string
  url: string
}

export type AdminCompany = {
  id: string
  name: string
  bin: string
  status: CompanyStatus
  rejection_reason: string | null
  documents: CompanyDocument[] | null
  // Повторная подача после отказа: покупатель исправил реквизиты или догрузил
  // документы, и заявка вернулась в очередь модерации (null — не переподавали).
  resubmitted_at: string | null
  created_at: string
  updated_at: string
}

export type AdminCompanySpendLimit = {
  id: string
  amount: number
  currency_code: string
  period: "order" | "day" | "week" | "month"
}

export type AdminCompanyEmployee = {
  id: string
  role: "admin" | "member"
  created_at: string
  customer: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  } | null
  spend_limits: AdminCompanySpendLimit[] | null
}

export type AdminCompanyDetail = AdminCompany & {
  employees: AdminCompanyEmployee[]
}

export type AdminCompaniesListResponse = {
  companies: AdminCompany[]
  count: number
  offset: number
  limit: number
}

export type AdminCompanyResponse = {
  company: AdminCompanyDetail
}

// Метаданные статусов модерации. label — i18n-ключ (рендерится через t(...)
// в местах потребления). color — палитра StatusBadge (карточка), dotClass —
// точка в списках (идиома StatusCell стандартных таблиц ядра).
export const COMPANY_STATUS_META: Record<
  CompanyStatus,
  { label: string; color: "orange" | "green" | "red"; dotClass: string }
> = {
  pending: {
    label: "companies.status.pending",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  approved: {
    label: "companies.status.approved",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  rejected: {
    label: "companies.status.rejected",
    color: "red",
    dotClass: "bg-ui-tag-red-icon",
  },
}
