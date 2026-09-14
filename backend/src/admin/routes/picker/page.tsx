import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { PICKER_APP_URL } from "../../lib/picker-app"

// Единственный экран сборщика в веб-панели (решение владельца 2026-09-06).
//
// ЗАЧЕМ. Рабочее место сборщика — мобильное приложение `apps/partner`: он ходит
// по складу с телефоном, а не сидит за компьютером (T10.12). Веб-панель ему не
// нужна вовсе, но учётка у него admin-овая, и войти он в неё может. До этого
// экрана роль `picker` не совпадала с `seller`, падала в `owner`, и сборщик
// открывал панель магазина ЦЕЛИКОМ — склад, акции, прайс-листы, все заказы.
//
// Поэтому: `shell-redirect.ts` уводит сборщика сюда с любого адреса панели,
// `styles/shell.css` убирает у него сайдбар целиком, а страница объясняет, куда
// идти. Это не права доступа (admin-API ядра открыт всем admin-пользователям) —
// это честный ответ на вопрос «а что мне тут делать».
//
// Пункта в сайдбаре у страницы нет намеренно: `defineRouteConfig` не
// экспортируется, поэтому адрес живёт, а ссылки на него в меню не появляется —
// ни у продавца, ни у владельца.
const PickerPage = () => {
  const { t } = useTranslation()

  return (
    <Container className="flex flex-col items-start gap-y-4 px-6 py-10">
      <Heading level="h1">{t("picker.title")}</Heading>
      <Text className="text-ui-fg-subtle">{t("picker.description")}</Text>
      <Text size="small" className="text-ui-fg-muted">
        {t("picker.hint")}
      </Text>
      <a
        href={PICKER_APP_URL}
        className="text-ui-fg-interactive"
        target="_blank"
        rel="noreferrer"
      >
        {PICKER_APP_URL}
      </a>
    </Container>
  )
}

export default PickerPage
