import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import { getServerMessages } from "@lib/i18n/server"

const EmptyCartMessage = async () => {
  const m = await getServerMessages()
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        {m.cart.title}
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        {m.cart.emptyDescription}
      </Text>
      <div>
        <InteractiveLink href="/store">
          {m.cart.exploreProducts}
        </InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
