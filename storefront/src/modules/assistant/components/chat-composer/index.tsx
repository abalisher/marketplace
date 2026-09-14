"use client"

import {
  ATTACHMENT_ACCEPT,
  ChatAttachment,
  MAX_FILES_PER_TURN,
} from "@lib/assistant/file-attachment"
import { useMessages } from "@lib/i18n/i18n-context"
import { MAX_VOICE_MS } from "@lib/voice/voice-recorder"
import AttachmentChip from "@modules/assistant/components/attachment-chip"
import { useFileAttachments } from "@modules/assistant/hooks/use-file-attachments"
import { useVoiceInput } from "@modules/assistant/hooks/use-voice-input"
import Microphone from "@modules/common/icons/microphone"
import Paperclip from "@modules/common/icons/paperclip"
import Spinner from "@modules/common/icons/spinner"
import X from "@modules/common/icons/x"
import { ArrowUpMini, MediaStopSolid } from "@medusajs/icons"
import {
  ChangeEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

// Максимум 8 строк, дальше — внутренний скролл (бриф T10.1a раздел 3.3).
const MAX_LINES = 8
// Строка поля — 26px: текст композера идёт по шкале разговорного экрана
// (16/26), и высота авто-роста считается по ней же.
const LINE_HEIGHT = 26
const VERTICAL_PADDING = 16

// Предел записи в секундах — на таймере показываем «12/60»: покупателю важно не
// только сколько он уже говорит, но и сколько осталось до серверного предела.
const MAX_VOICE_SECONDS = MAX_VOICE_MS / 1000

const elapsedSeconds = (ms: number) =>
  Math.min(Math.floor(ms / 1000), MAX_VOICE_SECONDS)

// Композер по эталону Gemini (бриф T10.1a раздел 3.3): крупная пилюля
// (radius 28), авторост поля до 8 строк, круглая кнопка отправки 48px и
// дисклеймер под полем.
// Поле НЕ блокируется на время хода: покупатель может печатать следующий
// вопрос, недоступна только отправка. Enter отправляет, Shift+Enter — перенос.
// На время хода круглая кнопка становится «Стоп» (T10.1d): ответ печатается
// стримингом, и прервать его можно там же, где только что была отправка, — как
// в эталоне.
//
// Голосовой ввод (T10.3) — кнопка микрофона перед отправкой. Голос НЕ отдельный
// «режим расчёта» (требование T11.4): распознанный текст дописывается в это же
// поле, покупатель правит его и отправляет обычным сообщением. Пока идёт
// запись, поле уступает место индикатору с таймером и отменой — иначе
// непонятно, слушает микрофон сейчас или нет.
//
// Вложения (T10.4b) — скрепка рядом с микрофоном. Выбранные файлы стоят чипами
// НАД полем, внутри той же пилюли: покупатель видит, что уйдёт вместе с
// репликой, и убирает лишнее крестиком. Отправка допускается и с пустым
// текстом — снимок листа без подписи это нормальное сообщение.
const ChatComposer = ({
  isSending,
  placeholder,
  onSend,
  onStop,
}: {
  isSending: boolean
  placeholder: string
  onSend: (text: string, files: ChatAttachment[]) => void
  // Прервать идущий ход. Не передан — «Стоп» не показываем (ход непрерываемый:
  // например, откат на обычный POST).
  onStop?: () => void
}) => {
  const m = useMessages()
  const [draft, setDraft] = useState("")
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Расшифровка ДОПИСЫВАЕТСЯ к набранному, а не заменяет его: покупатель мог
  // начать печатать и договорить голосом. Фокус возвращаем в поле — правка до
  // отправки и есть смысл этого пути.
  const appendTranscript = useCallback((text: string) => {
    setDraft((current) => (current.trim() ? `${current.trim()} ${text}` : text))
    fieldRef.current?.focus()
  }, [])

  const voice = useVoiceInput(appendTranscript)
  const isRecording = voice.status === "recording"
  const isTranscribing = voice.status === "transcribing"
  const isVoiceBusy = isRecording || isTranscribing

  const attachments = useFileAttachments()

  // Авторост: высоту считаем по содержимому и упираемся в 8 строк.
  useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) {
      return
    }
    field.style.height = "auto"
    field.style.height = `${Math.min(
      field.scrollHeight,
      MAX_LINES * LINE_HEIGHT + VERTICAL_PADDING
    )}px`
  }, [draft])

  // Пустая отправка — это отправка без текста И без вложений: снимок без
  // подписи отправлять можно (T10.4).
  const isEmpty = draft.trim().length === 0 && attachments.files.length === 0
  const canStop = isSending && Boolean(onStop)

  const submit = () => {
    if (isEmpty || isSending || isVoiceBusy || attachments.isReading) {
      return
    }
    onSend(draft.trim(), attachments.files)
    setDraft("")
    attachments.clear()
  }

  // Диалог выбора файлов. Значение поля сбрасываем: без этого повторный выбор
  // ТОГО ЖЕ файла (убрал крестиком, передумал) не вызывает `change`.
  const pickFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      attachments.pick(event.target.files)
    }
    event.target.value = ""
  }

  // Строка под композером одна, и очередь у неё такая: сначала голос, потом
  // вложения, потом дисклеймер — говорим о том, что покупатель делал последним.
  const failure = voice.error
    ? {
        text: m.assistant.voice.errors[voice.error],
        dismiss: voice.dismissError,
      }
    : attachments.error
    ? {
        text: m.assistant.files.errors[attachments.error],
        dismiss: attachments.dismissError,
      }
    : null

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col rounded-composer border border-line bg-surface py-2 pl-4 pr-2 focus-within:border-accent">
        {/* Выбранное вложение живёт над полем, внутри пилюли: реплика и файлы
            уйдут одним сообщением, и выглядеть это должно как одно целое. */}
        {(attachments.files.length > 0 || attachments.isReading) && (
          <div className="flex flex-wrap items-center gap-2 pb-2 pr-2 pt-1">
            {attachments.files.map((file) => (
              <AttachmentChip
                key={file.id}
                attachment={file}
                onRemove={() => attachments.remove(file.id)}
              />
            ))}
            {attachments.isReading && (
              <span
                className="flex items-center gap-2 text-body-medium text-ink-secondary"
                aria-live="polite"
                data-testid="attachment-reading"
              >
                <Spinner size="16" />
                {m.assistant.files.reading}
              </span>
            )}
          </div>
        )}

        {/* Кнопки стоят В ОДНОМ ряду с полем на любой ширине. Раньше на узком
            экране их приходилось переносить под поле: трёх кругов по 48px
            (скрепка, микрофон, отправка) на 390px не оставалось места, и
            подсказка обрезалась на полуслове (находка гейта U T10.4b). Теперь
            круга всегда два — микрофон и отправка делят одно место, как в
            эталоне, — и ряд помещается целиком.
            `items-center`, не `items-end`: поле в одну строку (42px) ниже
            круглых кнопок (48px), и выравнивание по низу оставляло плейсхолдер
            прижатым кверху пилюли — на приветственном экране, где пилюля стоит
            одна, без соседних строк, сдвиг был особенно заметен (правка
            владельца по стенду 2026-09-14). Центр держит однострочный ввод
            ровно посередине; при авторосте до 8 строк кнопки центрируются по
            высоте поля, а не пришиты к его низу — для короткого поля чата это
            эталону ближе, чем пришпиленный делитель.
        */}
        <div className="flex w-full items-center gap-1 small:gap-2">
          {isVoiceBusy ? (
            // Место поля занимает состояние записи: покупатель обязан видеть,
            // что микрофон слушает, сколько уже записано и как это бросить.
            <div
              className="flex min-w-0 flex-1 items-center gap-3 py-3"
              aria-live="polite"
              data-testid="voice-indicator"
            >
              {isRecording ? (
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 animate-pulse rounded-circle bg-error"
                />
              ) : (
                <Spinner size="16" />
              )}
              <span className="text-assistant-body text-ink">
                {isRecording
                  ? m.assistant.voice.recording
                  : m.assistant.voice.transcribing}
              </span>
              {isRecording && (
                <span
                  className="text-body-medium tabular-nums text-ink-secondary"
                  data-testid="voice-timer"
                >
                  {elapsedSeconds(voice.elapsedMs)}/{MAX_VOICE_SECONDS}
                </span>
              )}
            </div>
          ) : (
            <textarea
              ref={fieldRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  submit()
                }
              }}
              rows={1}
              placeholder={placeholder}
              className="min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-assistant-body text-ink outline-none placeholder:text-ink-secondary"
              data-testid="chat-input"
            />
          )}

          <div className="flex items-center justify-end gap-1 small:gap-2">
            {/* Отмена: запись выбрасывается, в поле ничего не попадает. Стоит
              рядом с микрофоном — бросить надо там же, где начал. */}
            {isVoiceBusy && (
              <button
                type="button"
                onClick={voice.cancel}
                aria-label={m.assistant.voice.cancel}
                title={m.assistant.voice.cancel}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-circle text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink"
                data-testid="voice-cancel-button"
              >
                <X size="20" />
              </button>
            )}

            {/* Скрепка (T10.4b). Во время записи её нет: поле уступило место
              индикатору, и прикладывать файл к записи, которой ещё не
              существует, некуда. Предел в три файла кнопку НЕ гасит —
              покупатель узнаёт о нём строкой отказа, а не молчащей кнопкой. */}
            {!isVoiceBusy && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ATTACHMENT_ACCEPT}
                  multiple={MAX_FILES_PER_TURN > 1}
                  onChange={pickFiles}
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden
                  data-testid="attachment-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={m.assistant.files.attach}
                  title={m.assistant.files.attach}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-circle text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink"
                  data-testid="attachment-button"
                >
                  <Paperclip size="20" />
                </button>
              </>
            )}

            {/* Микрофон: одна кнопка и на «начать», и на «закончить» — как в
              эталоне. Браузер записи не умеет — кнопки нет вовсе (неактивные
              заглушки прогоны отмечали как «мешает»). */}
            {voice.isSupported &&
              !isTranscribing &&
              (isEmpty || isRecording) && (
                <button
                  type="button"
                  onClick={isRecording ? voice.stop : voice.start}
                  aria-label={
                    isRecording
                      ? m.assistant.voice.finish
                      : m.assistant.voice.start
                  }
                  title={
                    isRecording
                      ? m.assistant.voice.finish
                      : m.assistant.voice.start
                  }
                  aria-pressed={isRecording}
                  className={
                    isRecording
                      ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-circle bg-error text-surface transition-colors"
                      : "flex h-12 w-12 shrink-0 items-center justify-center rounded-circle text-ink-secondary transition-colors hover:bg-surface-dim hover:text-ink"
                  }
                  data-testid="voice-button"
                >
                  <Microphone size="20" />
                </button>
              )}

            {/* Кнопка отправки: 48px — минимальный тап-таргет гейта U (круг в 40px
              промахивался пальцем, прогон 2026-08-13). На время хода на её месте
              стоит «Стоп» (эталон Gemini). */}
            {/* Отправка занимает место микрофона, как только есть что
              отправлять (эталон: в пустом поле кнопки отправки нет вовсе —
              неактивный круг прогоны отмечали как «мешает»). На время хода
              там же стоит «Стоп». */}
            {canStop ? (
              <button
                type="button"
                onClick={onStop}
                aria-label={m.assistant.composer.stop}
                title={m.assistant.composer.stop}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-circle bg-ink text-surface transition-colors hover:bg-ink-secondary"
                data-testid="chat-stop-button"
              >
                <MediaStopSolid />
              </button>
            ) : isEmpty && !attachments.isReading ? null : (
              <button
                type="button"
                onClick={submit}
                disabled={isSending || isVoiceBusy || attachments.isReading}
                aria-label={m.assistant.send}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-circle bg-accent text-on-accent transition-colors hover:bg-accent-pressed disabled:bg-line disabled:text-ink-secondary"
                data-testid="chat-send-button"
              >
                <ArrowUpMini />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Неудача голоса или вложения говорит ТЕКСТОМ и не отнимает ручной ввод:
          «не расслышали» и «этот файл не читаем» — тоже сообщения, а не
          молчание. Нажатие убирает строку и возвращает дисклеймер. */}
      {failure ? (
        <button
          type="button"
          onClick={failure.dismiss}
          className="text-center text-assistant-caption text-error"
          data-testid="composer-error"
        >
          {failure.text}
        </button>
      ) : (
        <p className="text-center text-assistant-caption text-ink-secondary">
          {m.assistant.composer.disclaimer}
        </p>
      )}
    </div>
  )
}

export default ChatComposer
