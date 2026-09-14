import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { getServerMessages } from "@lib/i18n/server"

const Help = async () => {
  const m = await getServerMessages()
  return (
    <div className="mt-6">
      <Heading className="text-body-large font-semibold">
        {m.order.needHelp}
      </Heading>
      <div className="text-body-large my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">
              {m.order.contact}
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              {m.order.returnsExchanges}
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
