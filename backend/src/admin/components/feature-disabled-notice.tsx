import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

// Заглушка отключённого раздела панели (T10.9). Страницы замороженных доменов
// не удаляются и остаются по своим адресам — открывший ссылку из закладки
// видит объяснение, а не пустую таблицу и ошибку сети.
const FeatureDisabledNotice = ({ message }: { message: string }) => {
  const { t } = useTranslation()

  return (
    <Container className="flex flex-col gap-y-2 px-6 py-8">
      <Heading>{t("common.featureDisabled.title")}</Heading>
      <Text className="text-ui-fg-subtle" size="small">
        {message}
      </Text>
    </Container>
  )
}

export default FeatureDisabledNotice
