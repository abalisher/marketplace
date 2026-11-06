import { Container, Heading, Text } from "@medusajs/ui"

import {
  isStripeLike,
  paymentInfoMap,
  paymentMethodByProvider,
} from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getServerMessages } from "@lib/i18n/server"
import { CreditCard } from "@medusajs/icons"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = async ({ order }: PaymentDetailsProps) => {
  const m = await getServerMessages()
  const payment = order.payment_collections?.[0]?.payments?.[0]

  // Подпись способа — из словаря по коду способа (Kaspi QR, перевод, долг);
  // незнакомый провайдер — запасная подпись, но не сырой id провайдера.
  const methodCode = paymentMethodByProvider(payment?.provider_id)
  const methodTitle = methodCode
    ? m.payment.methods[methodCode].title
    : (payment && paymentInfoMap[payment.provider_id]?.title) ||
      m.checkout.payment.title

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        {m.checkout.payment.title}
      </Heading>
      <div>
        {payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="text-body-large font-semibold text-ink mb-1">
                {m.checkout.payment.methodLabel}
              </Text>
              <Text
                className="text-body-large text-ink-secondary"
                data-testid="payment-method"
              >
                {methodTitle}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="text-body-large font-semibold text-ink mb-1">
                {m.checkout.payment.detailsLabel}
              </Text>
              <div className="flex gap-2 text-body-large text-ink-secondary items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-surface-dim">
                  {paymentInfoMap[payment.provider_id]?.icon || <CreditCard />}
                </Container>
                <Text data-testid="payment-amount">
                  {isStripeLike(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} ${m.order.paidAt} ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString()}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
