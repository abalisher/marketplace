import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { transcribeVoiceMessage } from "../../../../lib/assistant/speech"
import { StoreAssistantTranscribeType } from "../validators"

// POST /store/assistant/transcribe — распознать голосовое сообщение покупателя
// (T10.2). Гость допускается, как и в чате: покупатель начинает разговор до
// входа.
//
// Роут возвращает ТОЛЬКО расшифровку — ход ассистента он не делает. Так решено
// по требованию T11.4/T10.3: голос не отдельный «режим расчёта», распознанный
// текст падает в композер, покупатель может его поправить и отправляет обычным
// сообщением в /store/assistant/chat. Ассистент, принимающий аудио и сразу
// отвечающий (буква T10.2), эту правку сделал бы невозможной, поэтому такого
// пути нет — см. docs/DECISIONS.md 2026-08-31.
//
// Пустой `text` — не ошибка: значит не расслышали (тишина, шум). Клиент честно
// говорит об этом и оставляет покупателю ручной ввод.
export async function POST(
  req: AuthenticatedMedusaRequest<StoreAssistantTranscribeType>,
  res: MedusaResponse
) {
  const { mime_type, data, duration_ms } = req.validatedBody
  const transcript = await transcribeVoiceMessage({
    mimeType: mime_type,
    data,
    durationMs: duration_ms,
  })
  res.json({ text: transcript.text, language: transcript.language })
}
