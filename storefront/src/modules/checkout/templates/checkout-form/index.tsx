import { listCartShippingMethods } from "@lib/data/fulfillment"
import { getCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  // Способы оплаты — продавца корзины (Kaspi QR, перевод, долг), а не
  // провайдеры региона ядра. Сбой чтения не прячет весь чекаут: шаг оплаты
  // сам покажет ошибку.
  const [shippingMethods, paymentView] = await Promise.all([
    listCartShippingMethods(cart.id),
    getCartPaymentMethods(cart.id).catch(() => null),
  ])

  if (!shippingMethods) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      <Payment cart={cart} paymentView={paymentView} />

      <Review cart={cart} />
    </div>
  )
}
