// События оплаты заказа, после которых напечатанный счёт устаревает и
// перевыпускается новой версией (subscribers/order-payment-invoice.ts):
// покупатель сменил способ, продавец одобрил долг (срок), заказ оплачен целиком.
export const ORDER_PAYMENT_METHOD_CHANGED_EVENT = "order_payment.method_changed"
export const ORDER_PAYMENT_DEBT_APPROVED_EVENT = "order_payment.debt_approved"
export const ORDER_PAYMENT_PAID_EVENT = "order_payment.paid"
