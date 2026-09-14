import { retrieveMyCart } from "@lib/data/my-cart"
import { getServerMessages } from "@lib/i18n/server"
import CabinetEmpty from "@modules/cabinet/components/cabinet-empty"
import CartLines from "@modules/cabinet/components/cart-lines"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "What the assistant has collected in your cart.",
}

// Текущая корзина покупателя. Её собирает АССИСТЕНТ, поэтому корзину ищет
// бэкенд (`/store/carts/me`, T10.6a), а не cookie витрины: иначе на телефоне и
// в вебе кабинет показывал бы разные корзины. Пустая корзина и отсутствие
// корзины для покупателя — одно и то же состояние.
export default async function CabinetCartPage() {
  const [cart, m] = await Promise.all([retrieveMyCart(), getServerMessages()])
  const isEmpty = !cart || !cart.items?.length

  return (
    <section className="flex flex-col gap-4" data-testid="cabinet-cart-page">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-large text-ink">{m.cabinet.cart.title}</h1>
        <p className="text-body-large text-ink-secondary">
          {m.cabinet.cart.subtitle}
        </p>
      </div>

      {isEmpty ? (
        <CabinetEmpty
          title={m.cabinet.cart.empty}
          hint={m.cabinet.cart.emptyHint}
          action={m.cabinet.cart.continue}
        />
      ) : (
        <CartLines cart={cart} />
      )}
    </section>
  )
}
