import { useQuery } from "@tanstack/react-query"
import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlags,
  cachedFeatureFlags,
  fetchFeatureFlags,
} from "../lib/feature-flags"

// Фича-флаги бэкенда для экранов панели (T10.9). Пункты сайдбара убирает слой
// CSS (styles/shell.css), а сами страницы остаются по своим адресам: хук нужен
// им, чтобы вместо пустой таблицы и 404 показать понятное «раздел отключён».
//
// Пока ответ не пришёл, берём кэш прошлой сессии, а без кэша — «выключено»:
// показать раздел на кадр позже честнее, чем мигнуть тем, чего в продукте нет.
export const useFeatureFlags = () =>
  useQuery<FeatureFlags>({
    queryKey: ["feature-flags"],
    queryFn: fetchFeatureFlags,
    initialData: cachedFeatureFlags() ?? DEFAULT_FEATURE_FLAGS,
    // Отметка «данные из прошлой жизни»: без неё react-query считал бы
    // initialData свежими весь staleTime, и с ВКЛЮЧЁННЫМ флагом раздел на
    // первом заходе (кэша ещё нет) пять минут показывал бы «отключён».
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000,
  })
