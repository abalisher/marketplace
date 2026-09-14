import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

// Подпись варианта в строке заказа/корзины. Служебное «Variant:» убрано:
// покупателю нужен сам вариант («Мешок 50 кг»), а не английская метка.
const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  if (!variant?.title) {
    return null
  }

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block w-full overflow-hidden text-ellipsis text-body-medium text-ink-secondary"
    >
      {variant.title}
    </Text>
  )
}

export default LineItemOptions
