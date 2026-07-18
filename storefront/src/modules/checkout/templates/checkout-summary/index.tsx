import { Heading } from "@medusajs/ui"

import { retrieveBonusBalance } from "@lib/data/bonus"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import BonusForm from "@modules/checkout/components/bonus-form"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = async ({ cart }: { cart: any }) => {
  const bonusBalance = await retrieveBonusBalance()

  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0 ">
      <div className="w-full bg-white flex flex-col">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline"
        >
          In your Cart
        </Heading>
        <Divider className="my-6" />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} />
          <BonusForm cart={cart} balance={bonusBalance} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
