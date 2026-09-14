// Запись голосового сообщения в браузере (T10.3). Транспорта и диалога здесь
// нет: класс только пишет звук с микрофона и отдаёт его в том виде, в котором
// его ждёт `POST /store/assistant/transcribe` — контейнер как есть + base64.
//
// Пределы совпадают с серверными (backend/src/lib/assistant/speech.ts): 60 с и
// 8 МБ. Обрезаем на клиенте, чтобы покупатель узнал о пределе до отправки, а не
// получил 400 после минуты разговора.
export const MAX_VOICE_MS = 60_000
export const MAX_VOICE_BYTES = 8 * 1024 * 1024

// Почему запись не пошла. Текст для покупателя выбирает UI — здесь только
// причина, потому что тексты локализованы.
export type VoiceRecorderFailure =
  // Браузер не умеет запись (нет MediaRecorder / getUserMedia).
  | "unsupported"
  // getUserMedia недоступен вне защищённого контекста: http без localhost.
  | "insecure"
  // Покупатель (или политика браузера) отказал в доступе к микрофону.
  | "denied"
  // Микрофона нет вовсе или он занят другим приложением.
  | "failed"
  // Записалось больше 8 МБ — отправлять нечего, предупреждаем честно.
  | "tooLarge"

export class VoiceRecorderError extends Error {
  constructor(readonly reason: VoiceRecorderFailure) {
    super(`voice recorder: ${reason}`)
    this.name = "VoiceRecorderError"
  }
}

// Готовая запись в том виде, в каком её принимает бэкенд.
export type VoiceRecording = {
  mimeType: string
  // Тело записи в base64 БЕЗ префикса data:.
  data: string
  durationMs: number
}

// Контейнеры по убыванию предпочтения. Chrome/Firefox пишут webm/opus, Safari —
// mp4/aac. Перебираем сами, потому что MediaRecorder без явного mimeType на
// части браузеров молча берёт формат, который бэкенд не примет.
const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
]

const pickMimeType = () => {
  if (typeof MediaRecorder === "undefined") {
    return undefined
  }
  return PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type))
}

// Умеет ли браузер запись вообще. Отдельно от «отказано»: в первом случае
// кнопку микрофона показывать незачем, во втором — она работает после
// разрешения.
export const isVoiceRecordingSupported = () =>
  typeof navigator !== "undefined" &&
  typeof MediaRecorder !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia)

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new VoiceRecorderError("failed"))
    reader.onload = () => {
      const result = String(reader.result)
      // FileReader отдаёт `data:<mime>;base64,<данные>` — бэкенду нужны только
      // данные.
      resolve(result.slice(result.indexOf(",") + 1))
    }
    reader.readAsDataURL(blob)
  })

/// Одна запись = один экземпляр в состоянии экрана: `start` → `stop`/`cancel`.
export class VoiceRecorder {
  private recorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: Blob[] = []
  private startedAt = 0

  // Открывает микрофон и начинает писать. Бросает VoiceRecorderError —
  // покупателю надо сказать РОВНО причину, иначе он будет жать на кнопку,
  // которая молчит.
  async start(): Promise<void> {
    if (!isVoiceRecordingSupported()) {
      // Вне защищённого контекста navigator.mediaDevices не существует вовсе —
      // это не «браузер не умеет», а «нужен https».
      throw new VoiceRecorderError(
        typeof window !== "undefined" && !window.isSecureContext
          ? "insecure"
          : "unsupported"
      )
    }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      const name = (error as { name?: string })?.name
      throw new VoiceRecorderError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : "failed"
      )
    }
    const mimeType = pickMimeType()
    try {
      this.recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      )
    } catch {
      stream.getTracks().forEach((track) => track.stop())
      throw new VoiceRecorderError("unsupported")
    }
    this.stream = stream
    this.chunks = []
    this.startedAt = Date.now()
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }
    this.recorder.start()
  }

  // Останавливает запись и отдаёт её. `null` — писать было нечего (кнопку
  // отпустили мгновенно): это не ошибка, просто отправлять нечего.
  async stop(): Promise<VoiceRecording | null> {
    const recorder = this.recorder
    if (!recorder) {
      return null
    }
    const durationMs = Date.now() - this.startedAt
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      if (recorder.state === "inactive") {
        resolve()
      } else {
        recorder.stop()
      }
    })
    this.release()
    const blob = new Blob(this.chunks, {
      type: recorder.mimeType || "audio/webm",
    })
    this.chunks = []
    if (blob.size === 0) {
      return null
    }
    if (blob.size > MAX_VOICE_BYTES) {
      throw new VoiceRecorderError("tooLarge")
    }
    return {
      mimeType: blob.type || "audio/webm",
      data: await toBase64(blob),
      // Длительность считает клиент: внутри контейнера opus/aac её без декодера
      // не прочитать — так же устроен и серверный предел (T10.2).
      durationMs: Math.max(1, Math.min(durationMs, MAX_VOICE_MS)),
    }
  }

  // Отмена: запись выбрасывается, микрофон освобождается.
  cancel(): void {
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.onstop = null
      this.recorder.stop()
    }
    this.chunks = []
    this.release()
  }

  // Микрофон обязан гаснуть сразу: горящий индикатор записи в вкладке после
  // отправки покупатель читает как «меня всё ещё слушают».
  private release(): void {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.recorder = null
  }
}
