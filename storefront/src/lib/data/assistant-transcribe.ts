import type { VoiceRecording } from "@lib/voice/voice-recorder"

// Распознавание голосового сообщения на клиенте (T10.3). Запрос идёт в наш
// route handler `/api/assistant/transcribe` (он добавляет авторизацию и
// publishable-ключ и проксирует запрос бэкенду).
//
// Голос — не отдельный «режим расчёта» (требование T11.4): роут возвращает
// ТОЛЬКО расшифровку, она падает в композер, а ассистенту уходит обычным
// сообщением, когда покупатель нажмёт отправку.

export type AssistantTranscript = {
  // Пустая строка — «не расслышали», штатный ответ, а не ошибка.
  text: string
  // Язык, на котором говорил покупатель (ru/kk/en) — по определению модели.
  language: string
}

export const transcribeVoice = async (
  recording: VoiceRecording,
  signal?: AbortSignal
): Promise<AssistantTranscript> => {
  const response = await fetch("/api/assistant/transcribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mime_type: recording.mimeType,
      data: recording.data,
      duration_ms: recording.durationMs,
    }),
    signal,
  })
  if (!response.ok) {
    throw new Error(`transcribe failed: ${response.status}`)
  }
  const body = (await response.json()) as Partial<AssistantTranscript>
  return { text: body.text ?? "", language: body.language ?? "" }
}
