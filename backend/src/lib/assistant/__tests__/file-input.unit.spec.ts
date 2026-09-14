import {
  MAX_FILES_PER_TURN,
  MAX_FILE_BYTES,
  MAX_TURN_FILES_BYTES,
  isTableMimeType,
  normalizeFileMimeType,
  prepareAssistantFiles,
} from "../file-input"

// Unit: граница приёма вложений чата (T10.4) — типы, пределы и приведение к
// виду `inlineData`. Всё чистое: разбор содержимого делает модель, здесь
// проверяется только то, что доедет до неё, а что честно отвалится с понятным
// текстом (тексты разные — покупателю в каждом случае надо сделать разное).

const base64OfBytes = (bytes: number): string =>
  Buffer.alloc(bytes, 1).toString("base64")

describe("normalizeFileMimeType", () => {
  it("accepts phone and gallery photos regardless of case and parameters", () => {
    expect(normalizeFileMimeType("image/jpeg")).toEqual("image/jpeg")
    expect(normalizeFileMimeType("IMAGE/JPG")).toEqual("image/jpeg")
    expect(normalizeFileMimeType("image/png; charset=binary")).toEqual("image/png")
    // Камера iPhone по умолчанию отдаёт heic.
    expect(normalizeFileMimeType("image/heic")).toEqual("image/heic")
    expect(normalizeFileMimeType("application/pdf")).toEqual("application/pdf")
  })

  it("rejects what the model cannot read as a picture", () => {
    expect(normalizeFileMimeType("video/mp4")).toBeNull()
    expect(normalizeFileMimeType("application/zip")).toBeNull()
    expect(normalizeFileMimeType("")).toBeNull()
  })
})

describe("isTableMimeType", () => {
  it("recognizes spreadsheets and text documents (parsed by T11.1, not by vision)", () => {
    expect(
      isTableMimeType(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ).toBe(true)
    expect(isTableMimeType("text/csv;charset=utf-8")).toBe(true)
    expect(
      isTableMimeType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe(true)
    expect(isTableMimeType("image/jpeg")).toBe(false)
    expect(isTableMimeType("application/pdf")).toBe(false)
  })
})

describe("prepareAssistantFiles", () => {
  it("passes a photo through and strips the data-URL prefix", () => {
    const raw = Buffer.from("photo-of-the-list").toString("base64")
    expect(
      prepareAssistantFiles([
        { mimeType: "image/jpeg", data: `data:image/jpeg;base64,${raw}`, name: "IMG_1.jpg" },
      ])
    ).toEqual([{ mimeType: "image/jpeg", data: raw }])
  })

  it("returns an empty list when there are no attachments", () => {
    expect(prepareAssistantFiles([])).toEqual([])
  })

  it("refuses spreadsheets separately from unknown formats", () => {
    expect(() =>
      prepareAssistantFiles([
        { mimeType: "text/csv", data: base64OfBytes(10) },
      ])
    ).toThrow(/Spreadsheets and text documents are not supported yet/)

    expect(() =>
      prepareAssistantFiles([
        { mimeType: "video/mp4", data: base64OfBytes(10) },
      ])
    ).toThrow(/Unsupported attachment format/)
  })

  it("refuses an empty payload", () => {
    expect(() =>
      prepareAssistantFiles([{ mimeType: "image/png", data: "" }])
    ).toThrow(/Attachment payload is empty/)
  })

  it("refuses a single file over the per-file limit", () => {
    expect(() =>
      prepareAssistantFiles([
        { mimeType: "image/jpeg", data: base64OfBytes(MAX_FILE_BYTES + 1) },
      ])
    ).toThrow(/Attachment is too large/)
  })

  it("refuses more files than one turn allows", () => {
    const files = Array.from({ length: MAX_FILES_PER_TURN + 1 }, () => ({
      mimeType: "image/jpeg",
      data: base64OfBytes(10),
    }))
    expect(() => prepareAssistantFiles(files)).toThrow(/Too many attachments/)
  })

  it("refuses a turn whose files together exceed the inline budget", () => {
    // Каждый файл в пределах своего лимита, но втроём они не влезают в запрос
    // к модели вместе с историей диалога.
    const files = Array.from({ length: 3 }, () => ({
      mimeType: "image/jpeg",
      data: base64OfBytes(MAX_FILE_BYTES - 1024),
    }))
    expect(MAX_FILE_BYTES * 3).toBeGreaterThan(MAX_TURN_FILES_BYTES)
    expect(() => prepareAssistantFiles(files)).toThrow(/Attachments are too large/)
  })
})
