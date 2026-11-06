"use client"

import { useCallback, useEffect, useState } from "react"
import {
  deleteRemoteConversation,
  listRemoteConversations,
  saveRemoteConversation,
} from "@lib/data/chat-history"
import { ChatConversation } from "./conversation"
import {
  ChatHistoryOwner,
  historyKey,
  loadConversations,
  normalizeConversations,
  saveConversations,
} from "./storage"
import { mergeConversations } from "./sync"

// История диалогов для чата витрины: читается после монтирования
// (localStorage недоступен на сервере) и пишется целиком при каждом изменении.
// У вошедшего покупателя история ещё и на сервере — одна лента на телефоне и
// компьютере (решение владельца 2026-10-29): после чтения устройства она
// сводится с серверной копией (lib/chat-history/sync.ts), а каждое изменение
// уходит на сервер. Гость — только устройство, как раньше. Логики диалога
// здесь нет — только хранение.
//
// История принадлежит владельцу (витрина × покупатель, см. storage.ts). Сменился
// владелец — «загружено» снова false, пока не прочитана ЕГО история: иначе
// восстановление диалога успело бы поднять чужую ленту, а сохранение — записать
// её под новым ключом.
export const useChatHistory = (owner: ChatHistoryOwner) => {
  const key = historyKey(owner)
  const [state, setState] = useState<{
    key: string | null
    conversations: ChatConversation[]
  }>({ key: null, conversations: [] })

  useEffect(() => {
    const local = loadConversations(owner)
    setState({ key, conversations: local })
    if (!owner.customerId) {
      return
    }
    let cancelled = false
    listRemoteConversations().then((remote) => {
      if (cancelled || !remote) {
        return
      }
      setState((current) => {
        if (current.key !== key) {
          return current
        }
        const { merged, upload } = mergeConversations(
          current.conversations,
          normalizeConversations(remote.conversations),
          remote.removed
        )
        saveConversations(owner, merged)
        upload.forEach((conversation) => saveRemoteConversation(conversation))
        return { key, conversations: merged }
      })
    })
    return () => {
      cancelled = true
    }
    // owner — это ровно key: перечитываем при смене владельца.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const isLoaded = state.key === key
  const conversations = isLoaded ? state.conversations : []

  const setConversations = useCallback(
    (update: (current: ChatConversation[]) => ChatConversation[]) => {
      setState((current) => {
        if (current.key !== key) {
          return current
        }
        const next = update(current.conversations)
        saveConversations(owner, next)
        return { key, conversations: next }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )

  // Апсерт по id: диалог всплывает наверх списка. Пишем в хранилище из того же
  // обновления состояния — иначе гонка «сохранили старое поверх нового».
  const upsert = useCallback(
    (conversation: ChatConversation) => {
      setConversations((current) => [
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ])
      if (owner.customerId) {
        saveRemoteConversation(conversation)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setConversations, owner.customerId]
  )

  // Переименование (T10.1b): позицию в списке НЕ меняем — покупатель правит
  // подпись, а не продолжает диалог. Пустое имя = отмена (решает вызывающий,
  // здесь страховка).
  const rename = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) {
        return
      }
      setConversations((current) => {
        const next = current.map((item) =>
          item.id === id
            ? { ...item, title: trimmed, titleCustom: true }
            : item
        )
        const renamed = next.find((item) => item.id === id)
        if (owner.customerId && renamed) {
          saveRemoteConversation(renamed)
        }
        return next
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setConversations, owner.customerId]
  )

  const remove = useCallback(
    (id: string) => {
      setConversations((current) => current.filter((item) => item.id !== id))
      if (owner.customerId) {
        deleteRemoteConversation(id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setConversations, owner.customerId]
  )

  return { conversations, isLoaded, upsert, rename, remove }
}
