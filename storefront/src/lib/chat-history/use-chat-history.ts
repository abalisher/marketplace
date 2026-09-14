"use client"

import { useCallback, useEffect, useState } from "react"
import { ChatConversation } from "./conversation"
import { loadConversations, saveConversations } from "./storage"

// Локальная история диалогов для чата витрины: читается один раз после
// монтирования (localStorage недоступен на сервере) и пишется целиком при
// каждом изменении. Логики диалога здесь нет — только хранение.
export const useChatHistory = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setConversations(loadConversations())
    setIsLoaded(true)
  }, [])

  // Апсерт по id: диалог всплывает наверх списка. Пишем в хранилище из того же
  // обновления состояния — иначе гонка «сохранили старое поверх нового».
  const upsert = useCallback((conversation: ChatConversation) => {
    setConversations((current) => {
      const next = [
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ]
      saveConversations(next)
      return next
    })
  }, [])

  // Переименование (T10.1b): позицию в списке НЕ меняем — покупатель правит
  // подпись, а не продолжает диалог. Пустое имя = отмена (решает вызывающий,
  // здесь страховка).
  const rename = useCallback((id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) {
      return
    }
    setConversations((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, title: trimmed, titleCustom: true } : item
      )
      saveConversations(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setConversations((current) => {
      const next = current.filter((item) => item.id !== id)
      saveConversations(next)
      return next
    })
  }, [])

  return { conversations, isLoaded, upsert, rename, remove }
}
