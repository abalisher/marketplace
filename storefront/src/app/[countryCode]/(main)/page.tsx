import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getServerMessages } from "@lib/i18n/server"

export const metadata: Metadata = {
  title: "СтройМаркет — черновые стройматериалы в Астане",
  description:
    "Черновые стройматериалы в Астане: отделочные материалы, электрика, сантехника и крепёж с доставкой и самовывозом.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const [region, m] = await Promise.all([
    getRegion(countryCode),
    getServerMessages(),
  ])

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 8 },
  })

  return (
    <>
      <Hero />
      <div className="content-container py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-heading-medium text-ink">{m.home.popular}</h2>
          <LocalizedClientLink
            href="/store"
            className="text-body-large text-accent hover:text-accent-pressed"
          >
            {m.home.wholeCatalogue}
          </LocalizedClientLink>
        </div>
        <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-8">
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
