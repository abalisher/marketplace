import { base64ByteLength, stripDataUrlPrefix } from "../../base64"
import {
  MAX_VOICE_BYTES,
  MAX_VOICE_DURATION_MS,
  normalizeVoiceMimeType,
  sanitizeTranscript,
  transcribeVoiceMessage,
} from "../speech"

// Unit: чистые части распознавания голоса (T10.2) — нормализация типа записи,
// подсчёт размера base64 без декодирования, санитизация ответа модели и защита
// пределов ДО вызова Gemini. Сам вызов модели покрыт live-smoke
// (src/scripts/smoke-stt.ts), качество распознавания по языкам — прогон T10.5.

describe("normalizeVoiceMimeType", () => {
  it("drops codec parameters and case as recorders send them", () => {
    // MediaRecorder в Chrome отдаёт ровно такую строку.
    expect(normalizeVoiceMimeType("audio/webm;codecs=opus")).toEqual("audio/webm")
    expect(normalizeVoiceMimeType("AUDIO/MP4")).toEqual("audio/mp4")
    expect(normalizeVoiceMimeType(" audio/ogg ; codecs=opus")).toEqual("audio/ogg")
  })

  it("maps m4a aliases to the container Gemini understands", () => {
    expect(normalizeVoiceMimeType("audio/x-m4a")).toEqual("audio/mp4")
    expect(normalizeVoiceMimeType("audio/m4a")).toEqual("audio/mp4")
    expect(normalizeVoiceMimeType("audio/x-wav")).toEqual("audio/wav")
  })

  it("rejects everything that is not an allowed audio container", () => {
    expect(normalizeVoiceMimeType("video/mp4")).toBeNull()
    expect(normalizeVoiceMimeType("application/pdf")).toBeNull()
    expect(normalizeVoiceMimeType("")).toBeNull()
  })
})

describe("base64ByteLength", () => {
  it("counts decoded bytes without decoding, honouring padding", () => {
    expect(base64ByteLength(Buffer.from("abc").toString("base64"))).toEqual(3)
    expect(base64ByteLength(Buffer.from("ab").toString("base64"))).toEqual(2)
    expect(base64ByteLength(Buffer.from("a").toString("base64"))).toEqual(1)
    expect(base64ByteLength("")).toEqual(0)
  })

  it("ignores line breaks and a data-URL prefix", () => {
    const raw = Buffer.from("0123456789ab").toString("base64")
    expect(base64ByteLength(`data:audio/webm;base64,${raw}`)).toEqual(12)
    expect(base64ByteLength(`${raw.slice(0, 8)}\n${raw.slice(8)}`)).toEqual(12)
  })
})

describe("stripDataUrlPrefix", () => {
  it("removes the prefix FileReader.readAsDataURL adds, keeps plain base64", () => {
    expect(stripDataUrlPrefix("data:audio/mp4;base64,AAAA")).toEqual("AAAA")
    expect(stripDataUrlPrefix("AAAA")).toEqual("AAAA")
  })
})

describe("sanitizeTranscript", () => {
  it("trims the text and reduces the language to a bare code", () => {
    expect(sanitizeTranscript({ text: "  нужен цемент М400 ", language: "ru-RU" }))
      .toEqual({ text: "нужен цемент М400", language: "ru" })
  })

  it("keeps mixed speech as the model returned it", () => {
    const mixed = "Маған 20 қап цемент керек, гипсокартон да бар ма?"
    expect(sanitizeTranscript({ text: mixed, language: "kk" })).toEqual({
      text: mixed,
      language: "kk",
    })
  })

  it("treats an unrecognisable language as unknown", () => {
    expect(sanitizeTranscript({ text: "hello", language: "Russian" }).language)
      .toBeNull()
    expect(sanitizeTranscript({ text: "hello", language: "" }).language).toBeNull()
    expect(sanitizeTranscript({ text: "hello", language: 42 }).language).toBeNull()
  })

  it("returns empty text for junk instead of inventing words", () => {
    expect(sanitizeTranscript(null)).toEqual({ text: "", language: null })
    expect(sanitizeTranscript({ text: 42 })).toEqual({ text: "", language: null })
    expect(sanitizeTranscript({})).toEqual({ text: "", language: null })
  })
})

describe("transcribeVoiceMessage limits", () => {
  // Пределы проверяются ДО обращения к модели: ключ Gemini здесь не нужен, а
  // запрос за 8 МБ или неверный контейнер не должен доходить до сети.
  const someAudio = Buffer.from("fake-audio-bytes").toString("base64")

  it("rejects an unsupported container", async () => {
    await expect(
      transcribeVoiceMessage({ mimeType: "video/mp4", data: someAudio })
    ).rejects.toThrow("Unsupported audio format")
  })

  it("rejects a recording longer than the limit", async () => {
    await expect(
      transcribeVoiceMessage({
        mimeType: "audio/webm",
        data: someAudio,
        durationMs: MAX_VOICE_DURATION_MS + 1000,
      })
    ).rejects.toThrow("too long")
  })

  it("rejects an empty and an oversized payload", async () => {
    await expect(
      transcribeVoiceMessage({ mimeType: "audio/webm", data: "" })
    ).rejects.toThrow("empty")

    // Ровно на 4 символа base64 больше предела (это +3 байта) — проверяем
    // границу, а не «очень большую строку».
    const oversized = "A".repeat(Math.ceil(MAX_VOICE_BYTES / 3) * 4 + 4)
    await expect(
      transcribeVoiceMessage({ mimeType: "audio/webm", data: oversized })
    ).rejects.toThrow("too large")
  })
})
