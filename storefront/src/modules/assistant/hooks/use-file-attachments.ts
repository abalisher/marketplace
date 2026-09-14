"use client"

import {
  AttachmentError,
  AttachmentFailure,
  ChatAttachment,
  MAX_FILES_PER_TURN,
  readAttachment,
} from "@lib/assistant/file-attachment"
import { useCallback, useRef, useState } from "react"

// Вложения, набранные для СЛЕДУЮЩЕЙ реплики (T10.4b). Хук держит их до
// отправки: покупатель выбрал не тот кадр — убирает его крестиком, добавляет
// ещё один, и только потом жмёт отправку.
//
// Два правила, за которые отвечает именно этот хук:
//  * годные файлы из выбора берём, даже если один из них негоден: покупатель
//    отметил три снимка листа, четвёртым случайно захватил видео — терять из-за
//    этого первые три нельзя;
//  * отказ говорит ПРИЧИНУ (тип, размер, число), потому что делать в каждом
//    случае надо разное: сжать кадр, убрать лишний файл, снять таблицу на фото.

export type FileAttachmentsController = {
  files: ChatAttachment[]
  error: AttachmentFailure | null
  // Файл ещё читается: на восьмимегабайтном PDF это заметно, и композер
  // показывает ожидание вместо «ничего не произошло».
  isReading: boolean
  pick: (selected: FileList | File[]) => void
  remove: (id: string) => void
  clear: () => void
  dismissError: () => void
}

export const useFileAttachments = (): FileAttachmentsController => {
  const [files, setFiles] = useState<ChatAttachment[]>([])
  const [error, setError] = useState<AttachmentFailure | null>(null)
  const [isReading, setIsReading] = useState(false)

  // Набор читается асинхронно, а за это время покупатель мог убрать вложение
  // крестиком: складывать надо к АКТУАЛЬНОМУ списку, а не к тому, что был на
  // момент открытия диалога выбора.
  const filesRef = useRef<ChatAttachment[]>([])
  const commit = useCallback((next: ChatAttachment[]) => {
    filesRef.current = next
    setFiles(next)
  }, [])

  const read = useCallback(
    async (picked: File[]) => {
      let failure: AttachmentFailure | null = null
      for (const file of picked) {
        if (filesRef.current.length >= MAX_FILES_PER_TURN) {
          failure = failure ?? "tooMany"
          break
        }
        const turnBytes = filesRef.current.reduce(
          (sum, item) => sum + item.size,
          0
        )
        try {
          commit([...filesRef.current, await readAttachment(file, turnBytes)])
        } catch (reason) {
          // Первая причина и есть та, о которой говорим: перечень отказов на
          // три файла покупателю читать незачем.
          failure =
            failure ??
            (reason instanceof AttachmentError ? reason.reason : "failed")
        }
      }
      setError(failure)
      setIsReading(false)
    },
    [commit]
  )

  const pick = useCallback(
    (selected: FileList | File[]) => {
      const picked = Array.from(selected)
      if (picked.length === 0) {
        return
      }
      setError(null)
      setIsReading(true)
      void read(picked)
    },
    [read]
  )

  const remove = useCallback(
    (id: string) => {
      commit(filesRef.current.filter((file) => file.id !== id))
      setError(null)
    },
    [commit]
  )

  const clear = useCallback(() => {
    commit([])
    setError(null)
  }, [commit])

  return {
    files,
    error,
    isReading,
    pick,
    remove,
    clear,
    dismissError: () => setError(null),
  }
}
