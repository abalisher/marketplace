"use client"

// Свёрнутость рельса истории запоминается на устройстве (бриф T10.1a раздел
// 2.1): покупатель настроил раскладку один раз, и она держится между визитами.
// Ключ общий для чата и кабинета (T10.6) — рельс один и тот же, и расхождение
// состояния при переходе между ними бросалось бы в глаза.
const RAIL_STORAGE_KEY = "sm_chat_rail_collapsed"

export const loadRailCollapsed = () => {
  try {
    return window.localStorage.getItem(RAIL_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export const saveRailCollapsed = (isCollapsed: boolean) => {
  try {
    window.localStorage.setItem(RAIL_STORAGE_KEY, isCollapsed ? "1" : "0")
  } catch {
    // Недоступное хранилище не должно ломать экран.
  }
}
