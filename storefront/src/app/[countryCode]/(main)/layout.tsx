import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// Баннеры стартера про cookie-корзину (чужая корзина, «доберите до бесплатной
// доставки») убраны вместе с корзиной в шапке (T3.10): наполняет корзину
// ассистент в диалоге, cookie-корзина после пивота всегда пуста — каждая
// страница ходила за ней в бэкенд впустую.
export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
    </>
  )
}
