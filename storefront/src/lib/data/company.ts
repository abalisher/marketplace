"use server"

import { sdk } from "@lib/config"
import {
  COMPANY_DOCUMENT_MIME_TYPES,
  MAX_COMPANY_DOCUMENTS,
  MAX_COMPANY_DOCUMENT_BYTES,
} from "@lib/company/document-limits"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "./cookies"

// Компания покупателя (юрлицо) — наши роуты бэкенда `/store/companies`.
// Витрина только показывает состояние заявки и отправляет новую: статусы,
// модерацию и связывание покупателя с компанией держит бэкенд (модуль company).

export type CompanyStatus = "pending" | "approved" | "rejected"

export type CompanyDocument = { name: string; url: string }

export type Company = {
  id: string
  name: string
  bin: string
  status: CompanyStatus
  rejection_reason?: string | null
  documents?: CompanyDocument[] | null
  // Заявку переподали после отказа — она снова на модерации.
  resubmitted_at?: string | null
  created_at?: string | null
}

export type CompanyEmployee = { id: string; role: "admin" | "member" }

export type CompanyMembership = {
  company: Company
  employee: CompanyEmployee
}

// Компания текущего покупателя; null — покупатель не состоит в компании (404
// бэкенда) или не авторизован. Без кэша: статус модерации меняет админ, и
// покупатель должен видеть его сразу после перезагрузки страницы.
export async function retrieveCompany(): Promise<CompanyMembership | null> {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) {
    return null
  }

  try {
    return await sdk.client.fetch<CompanyMembership>("/store/companies/me", {
      method: "GET",
      headers: { ...authHeaders },
      cache: "no-store",
    })
  } catch {
    return null
  }
}

// Состояние формы заявки: код ошибки (текст подбирает клиент по словарю) и
// введённые значения — после отказа форма перерисовывается, и без них покупатель
// набирал бы название и БИН заново.
export type CompanyApplicationState = {
  error: string
  values: { name: string; bin: string }
}

// Отобранные файлы формы: код ошибки правил приёма либо готовые к отправке
// документы в base64. Правила те же, что на бэкенде (document-limits.ts) —
// проверяем до отправки нескольких мегабайт.
type PreparedFiles =
  | { error: string; files?: undefined }
  | { error?: undefined; files: CompanyFilePayload[] }

type CompanyFilePayload = {
  name: string
  mime_type: string
  content_base64: string
}

async function prepareDocuments(formData: FormData): Promise<PreparedFiles> {
  const selected = formData
    .getAll("documents")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (selected.length > MAX_COMPANY_DOCUMENTS) {
    return { error: "tooManyDocuments" }
  }
  if (selected.some((file) => file.size > MAX_COMPANY_DOCUMENT_BYTES)) {
    return { error: "documentTooLarge" }
  }
  if (
    selected.some((file) => !COMPANY_DOCUMENT_MIME_TYPES.includes(file.type))
  ) {
    return { error: "documentTypeNotSupported" }
  }

  return {
    files: await Promise.all(
      selected.map(async (file) => ({
        name: file.name,
        mime_type: file.type,
        content_base64: Buffer.from(await file.arrayBuffer()).toString(
          "base64"
        ),
      }))
    ),
  }
}

// Отправка заявки: название, БИН и учредительные документы файлами. null —
// заявка принята (страница перерисуется состоянием модерации).
export async function submitCompanyApplication(
  _currentState: CompanyApplicationState | null,
  formData: FormData
): Promise<CompanyApplicationState | null> {
  const name = ((formData.get("name") as string) ?? "").trim()
  const bin = ((formData.get("bin") as string) ?? "").replace(/\s/g, "")
  const failure = (error: string): CompanyApplicationState => ({
    error,
    values: { name, bin },
  })

  const authHeaders = await getAuthHeaders()

  if (!authHeaders) {
    return failure("unauthenticated")
  }

  if (!name) {
    return failure("nameRequired")
  }
  if (!/^\d{12}$/.test(bin)) {
    return failure("binInvalid")
  }

  const prepared = await prepareDocuments(formData)
  if (prepared.error) {
    return failure(prepared.error)
  }
  const files = prepared.files ?? []

  try {
    await sdk.client.fetch("/store/companies", {
      method: "POST",
      headers: { ...authHeaders },
      body: { name, bin, ...(files.length ? { files } : {}) },
    })
  } catch (error) {
    // БИН уже зарегистрирован — единственная ошибка, которую покупатель может
    // исправить сам; остальное показываем общим текстом.
    const message = error instanceof Error ? error.message : ""
    if (/bin|unique|duplicate/i.test(message)) {
      return failure("binTaken")
    }
    return failure("submitFailed")
  }

  // Профиль покупателя кэшируется тегом customers — сбрасываем, чтобы страница
  // аккаунта перерисовалась с новой заявкой.
  revalidateTag(await getCacheTag("customers"))

  return null
}

// Правка своей заявки: догрузить документы и — после отказа модератора —
// исправить реквизиты. Название и БИН приходят только из формы повторной
// подачи; в форме догрузки их нет вовсе, и бэкенд получает одни файлы.
// null — изменения приняты (страница перерисуется новым состоянием).
export async function updateCompanyApplication(
  _currentState: CompanyApplicationState | null,
  formData: FormData
): Promise<CompanyApplicationState | null> {
  const hasRequisites = formData.has("name") || formData.has("bin")
  const name = ((formData.get("name") as string) ?? "").trim()
  const bin = ((formData.get("bin") as string) ?? "").replace(/\s/g, "")
  const failure = (error: string): CompanyApplicationState => ({
    error,
    values: { name, bin },
  })

  const authHeaders = await getAuthHeaders()

  if (!authHeaders) {
    return failure("unauthenticated")
  }

  if (hasRequisites) {
    if (!name) {
      return failure("nameRequired")
    }
    if (!/^\d{12}$/.test(bin)) {
      return failure("binInvalid")
    }
  }

  const prepared = await prepareDocuments(formData)
  if (prepared.error) {
    return failure(prepared.error)
  }
  const files = prepared.files ?? []

  if (!hasRequisites && !files.length) {
    return failure("nothingToUpdate")
  }

  try {
    await sdk.client.fetch("/store/companies/me", {
      method: "POST",
      headers: { ...authHeaders },
      body: {
        ...(hasRequisites ? { name, bin } : {}),
        ...(files.length ? { files } : {}),
      },
    })
  } catch (error) {
    // Сообщения роутов не локализованы — переводим их в коды словаря по классу
    // ошибки. Порядок важен: текст про формат БИН тоже содержит «BIN».
    const message = error instanceof Error ? error.message : ""
    if (/12 digits/i.test(message)) {
      return failure("binInvalid")
    }
    if (/at most .* documents/i.test(message)) {
      return failure("tooManyDocumentsTotal")
    }
    if (/approved/i.test(message)) {
      return failure("requisitesLocked")
    }
    if (/bin|unique|duplicate/i.test(message)) {
      return failure("binTaken")
    }
    return failure("updateFailed")
  }

  revalidateTag(await getCacheTag("customers"))

  return null
}
