// Название компании для покупателя — без организационно-правовой формы:
// «ИП ORGSTROY» → «ORGSTROY», «ТОО «Компания Б»» → «Компания Б». Полное
// название (tenant.name) остаётся в панели и в документах — в счёте и накладной
// продавец обязан стоять с формой (lib/tenants/requisites.ts). Здесь — только
// витрина, ассистент и названия складов на странице прозрачности.

const LEGAL_FORMS = ["ИП", "ТОО", "АО", "ОАО", "ЗАО", "ПАО", "ООО", "LLP", "LLC", "JSC"]

// Форма — отдельным словом в начале или после пробела и с пробелом следом:
// «ИПОТЕКА» или «АОРТА» не задеваются.
const LEGAL_FORM = new RegExp(`(^|\\s)(?:${LEGAL_FORMS.join("|")})\\s+`, "g")

export const publicTenantName = (name: string): string => {
  const stripped = name.replace(LEGAL_FORM, "$1").trim()
  // Кавычки нужны, пока перед названием стоит форма; без неё — лишние.
  const unquoted = /^«[^«»]+»$/.test(stripped) ? stripped.slice(1, -1) : stripped
  return unquoted || name
}
