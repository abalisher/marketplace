import { getMessages } from "./dictionaries"
import { resolveLocale } from "./resolve-locale"

// Строки UI для СЕРВЕРНЫХ компонентов (клиентские — через useMessages()).
// Резолвит локаль из cookie и отдаёт словарь. Пример:
//   const m = await getServerMessages(); ...m.cart.title
export const getServerMessages = async () => getMessages(await resolveLocale())
