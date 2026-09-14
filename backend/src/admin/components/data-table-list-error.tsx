import { Button, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

// Ошибка загрузки списка панели (T12.4).
//
// ЗАЧЕМ. У ядрового `DataTable` нет состояния ошибки: упавший запрос отдаёт
// пустой массив, и таблица рисует «Ничего не найдено» — сотрудник читает это
// как «данных нет» и идёт работать с неверной картиной (находка T5.1a; на
// показе такой экран выглядит как «в магазине пусто»). Разница между «пусто»
// и «не загрузилось» обязана быть видна, а из тупика — вести кнопка.
//
// КАК. Блок ставится ВМЕСТО `DataTable.Table` и пагинации, когда `isError`:
//
//   {isError ? (
//     <DataTableListError message={t("companies.error")} onRetry={refetch} />
//   ) : (
//     <>…таблица и пагинация…</>
//   )}
//
// Подпись кнопки одна на все списки (`common.retry`) — своя формулировка
// «Повторить» на каждом экране ничего не добавляет.
type Props = {
  // Что именно не загрузилось, на языке экрана: «Не удалось загрузить заказы…».
  message: string
  onRetry: () => void
}

export const DataTableListError = ({ message, onRetry }: Props) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-start gap-y-3 px-6 py-10">
      <Text size="small" className="text-ui-fg-subtle">
        {message}
      </Text>
      <Button size="small" variant="secondary" onClick={onRetry}>
        {t("common.retry")}
      </Button>
    </div>
  )
}
