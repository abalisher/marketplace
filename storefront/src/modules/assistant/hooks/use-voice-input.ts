"use client"

import { transcribeVoice } from "@lib/data/assistant-transcribe"
import {
  MAX_VOICE_MS,
  VoiceRecorder,
  VoiceRecorderError,
  VoiceRecorderFailure,
  isVoiceRecordingSupported,
} from "@lib/voice/voice-recorder"
import { useCallback, useEffect, useRef, useState } from "react"

// Голосовой ввод композера (T10.3): запись → распознавание → текст в поле.
// Ассистенту голос НЕ уходит: расшифровка падает в композер, покупатель может
// её поправить и отправляет обычным сообщением (требование T11.4).
//
// Два правила, за которые отвечает именно этот хук:
//  * запись обрывается на 60 секундах САМА и уходит на распознавание — предел
//    серверный, и терять минуту речи из-за него нельзя;
//  * любая неудача говорит текстом: «молчащая кнопка микрофона» — худший из
//    возможных исходов, покупателю остаётся ручной ввод, и он должен об этом
//    узнать (требование T10.3 «деградировать вслух»).

export type VoiceInputStatus = "idle" | "recording" | "transcribing"

// Причины отказа = ключи сообщений. `empty` — модель ничего не разобрала
// (тишина, шум): по контракту T10.2 это не ошибка, а «не расслышали».
export type VoiceInputError = VoiceRecorderFailure | "empty"

export type VoiceInputController = {
  // Поддерживает ли браузер запись вообще: если нет — кнопки микрофона нет.
  isSupported: boolean
  status: VoiceInputStatus
  // Сколько идёт запись, мс — для таймера в композере.
  elapsedMs: number
  error: VoiceInputError | null
  start: () => void
  // Закончить запись и распознать.
  stop: () => void
  // Бросить запись (или распознавание) — в поле ничего не попадёт.
  cancel: () => void
  dismissError: () => void
}

// Шаг таймера записи: секунда — как в эталонных диктофонах.
const TICK_MS = 250

export const useVoiceInput = (
  onText: (text: string) => void
): VoiceInputController => {
  const [isSupported, setIsSupported] = useState(false)
  const [status, setStatus] = useState<VoiceInputStatus>("idle")
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<VoiceInputError | null>(null)

  const recorderRef = useRef<VoiceRecorder | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Запись бросили — расшифровку, которая уже летит, в поле не кладём.
  const cancelledRef = useRef(false)

  // Проверяем после монтирования: на сервере ни MediaRecorder, ни navigator
  // нет, и разметка разъехалась бы с гидратацией.
  useEffect(() => setIsSupported(isVoiceRecordingSupported()), [])

  // Уход со страницы посреди записи обязан гасить микрофон.
  useEffect(
    () => () => {
      recorderRef.current?.cancel()
      abortRef.current?.abort()
    },
    []
  )

  const finish = useCallback(
    async (recorder: VoiceRecorder) => {
      let recording
      try {
        recording = await recorder.stop()
      } catch (failure) {
        setStatus("idle")
        setError(
          failure instanceof VoiceRecorderError ? failure.reason : "failed"
        )
        return
      }
      if (!recording || cancelledRef.current) {
        // Нажали и сразу отпустили: записывать нечего — молча возвращаемся к
        // полю, ошибки тут нет.
        setStatus("idle")
        return
      }
      setStatus("transcribing")
      const abort = new AbortController()
      abortRef.current = abort
      try {
        const transcript = await transcribeVoice(recording, abort.signal)
        if (cancelledRef.current) {
          return
        }
        if (!transcript.text.trim()) {
          setError("empty")
        } else {
          onText(transcript.text.trim())
        }
      } catch {
        if (!cancelledRef.current) {
          setError("failed")
        }
      } finally {
        abortRef.current = null
        setStatus("idle")
      }
    },
    [onText]
  )

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || status !== "recording") {
      return
    }
    recorderRef.current = null
    void finish(recorder)
  }, [finish, status])

  // Таймер записи: он же обрывает запись на 60 секундах — предел серверный.
  useEffect(() => {
    if (status !== "recording") {
      return
    }
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      setElapsedMs(elapsed)
      if (elapsed >= MAX_VOICE_MS) {
        stop()
      }
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [status, stop])

  const start = useCallback(async () => {
    if (status !== "idle") {
      return
    }
    setError(null)
    setElapsedMs(0)
    cancelledRef.current = false
    const recorder = new VoiceRecorder()
    try {
      await recorder.start()
    } catch (failure) {
      setError(failure instanceof VoiceRecorderError ? failure.reason : "failed")
      return
    }
    recorderRef.current = recorder
    setStatus("recording")
  }, [status])

  const cancel = useCallback(() => {
    cancelledRef.current = true
    recorderRef.current?.cancel()
    recorderRef.current = null
    abortRef.current?.abort()
    abortRef.current = null
    setStatus("idle")
    setElapsedMs(0)
    setError(null)
  }, [])

  return {
    isSupported,
    status,
    elapsedMs,
    error,
    start: () => void start(),
    stop,
    cancel,
    dismissError: () => setError(null),
  }
}
