import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"
import { MedusaError } from "@medusajs/framework/utils"

// Шифрование пароля подключения к 1С (AES-256-GCM). Пароль нужен в открытом
// виде для каждого запроса к 1С, поэтому хешем его не заменить — но и лежать
// открытым текстом в базе ему нельзя (по той же причине из модели компании
// убраны ключи Kaspi, см. scripts/migrate-tenant-isolation.ts).
//
// Ключ — из ONEC_SECRET_KEY, а если он не задан — производный от JWT_SECRET
// (на стенде он есть всегда). Сменили секрет — сохранённые пароли не
// расшифруются, и экран попросит ввести пароль 1С заново.
//
// Формат шифротекста: v1:<iv base64>:<tag base64>:<данные base64>.

const VERSION = "v1"

const keyMaterial = (): string => {
  const secret = process.env.ONEC_SECRET_KEY || process.env.JWT_SECRET
  if (!secret) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Не задан ONEC_SECRET_KEY (или JWT_SECRET): пароль 1С нечем зашифровать"
    )
  }
  return secret
}

// Метка «onec:» разводит ключ шифрования с самим JWT-секретом: один и тот же
// секрет не служит двум целям в открытом виде.
const deriveKey = (): Buffer =>
  createHash("sha256").update(`onec:${keyMaterial()}`).digest()

export const encryptSecret = (plain: string): string => {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv)
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    data.toString("base64"),
  ].join(":")
}

export class OnecSecretError extends Error {}

export const decryptSecret = (cipherText: string): string => {
  const [version, iv, tag, data] = cipherText.split(":")
  if (version !== VERSION || !iv || !tag || data === undefined) {
    throw new OnecSecretError("Пароль 1С сохранён в неизвестном формате")
  }
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(),
      Buffer.from(iv, "base64")
    )
    decipher.setAuthTag(Buffer.from(tag, "base64"))
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8")
  } catch {
    throw new OnecSecretError(
      "Пароль 1С не расшифровывается (сменился секрет сервера) — введите его заново"
    )
  }
}
