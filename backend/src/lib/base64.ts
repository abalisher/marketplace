// Работа с base64-содержимым, которое клиент присылает телом запроса: голосовая
// запись (T10.2) и вложения чата — фото и PDF (T10.4). Обе задачи считают размер
// ДО декодирования и терпят префикс data-URL, поэтому помощники живут в одном
// месте, а не дублируются в каждом адаптере.

// Отбросить префикс data-URL («data:image/jpeg;base64,»). Браузер проще всего
// отдаёт файл через FileReader.readAsDataURL, и этот префикс в начале — самая
// частая причина «почему не работает».
export const stripDataUrlPrefix = (data: string): string => {
  const match = /^data:[^;,]*;base64,/i.exec(data)
  return match ? data.slice(match[0].length) : data
}

// Длина base64 в байтах — без декодирования (декодировать мегабайты только
// чтобы узнать размер незачем). Переводы строк игнорируем: часть кодировщиков
// разбивает строку на строки по 76 символов.
export const base64ByteLength = (data: string): number => {
  const payload = stripDataUrlPrefix(data).replace(/\s/g, "")
  if (payload.length === 0) {
    return 0
  }
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0
  return Math.floor((payload.length * 3) / 4) - padding
}

// Тот же размер в символах base64 (4 символа на 3 байта) — им ограничивают тело
// запроса валидаторы роутов, чтобы гигантская строка отваливалась до модели.
export const base64CharsForBytes = (bytes: number): number =>
  Math.ceil(bytes / 3) * 4
