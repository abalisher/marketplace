// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrder _$StoreOrderFromJson(Map<String, dynamic> json) => StoreOrder(
  itemSubtotal: json['item_subtotal'] as num,
  regionId: json['region_id'] as String,
  customerId: json['customer_id'] as String,
  salesChannelId: json['sales_channel_id'] as String,
  email: json['email'] as String,
  currencyCode: json['currency_code'] as String,
  shippingDiscountTotal: json['shipping_discount_total'] as num,
  itemDiscountTotal: json['item_discount_total'] as num,
  summary: BaseOrderSummary.fromJson(json['summary'] as Map<String, dynamic>),
  items: (json['items'] as List<dynamic>)
      .map((e) => StoreOrderLineItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingMethods: (json['shipping_methods'] as List<dynamic>)
      .map((e) => StoreOrderShippingMethod.fromJson(e as Map<String, dynamic>))
      .toList(),
  creditLineTotal: json['credit_line_total'] as num,
  paymentStatus: StoreOrderPaymentStatus.fromJson(
    json['payment_status'] as String,
  ),
  status: json['status'] as String,
  fulfillmentStatus: StoreOrderFulfillmentStatus.fromJson(
    json['fulfillment_status'] as String,
  ),
  id: json['id'] as String,
  originalShippingTaxTotal: json['original_shipping_tax_total'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  originalItemTotal: json['original_item_total'] as num,
  originalItemSubtotal: json['original_item_subtotal'] as num,
  originalItemTaxTotal: json['original_item_tax_total'] as num,
  itemTotal: json['item_total'] as num,
  discountTotal: json['discount_total'] as num,
  itemTaxTotal: json['item_tax_total'] as num,
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  total: json['total'] as num,
  subtotal: json['subtotal'] as num,
  taxTotal: json['tax_total'] as num,
  originalShippingTotal: json['original_shipping_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  giftCardTotal: json['gift_card_total'] as num,
  giftCardTaxTotal: json['gift_card_tax_total'] as num,
  shippingTotal: json['shipping_total'] as num,
  shippingSubtotal: json['shipping_subtotal'] as num,
  shippingTaxTotal: json['shipping_tax_total'] as num,
  originalShippingSubtotal: json['original_shipping_subtotal'] as num,
  billingAddress: json['billing_address'] == null
      ? null
      : StoreOrderAddress.fromJson(
          json['billing_address'] as Map<String, dynamic>,
        ),
  metadata: json['metadata'],
  customer: json['customer'] == null
      ? null
      : StoreCustomer.fromJson(json['customer'] as Map<String, dynamic>),
  transactions: (json['transactions'] as List<dynamic>?)
      ?.map((e) => BaseOrderTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  fulfillments: (json['fulfillments'] as List<dynamic>?)
      ?.map((e) => StoreOrderFulfillment.fromJson(e as Map<String, dynamic>))
      .toList(),
  paymentCollections: (json['payment_collections'] as List<dynamic>?)
      ?.map((e) => StorePaymentCollection.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingAddress: json['shipping_address'] == null
      ? null
      : StoreOrderAddress.fromJson(
          json['shipping_address'] as Map<String, dynamic>,
        ),
  displayId: json['display_id'] as num?,
  customDisplayId: json['custom_display_id'] as String?,
);

Map<String, dynamic> _$StoreOrderToJson(
  StoreOrder instance,
) => <String, dynamic>{
  'id': instance.id,
  'region_id': instance.regionId,
  'customer_id': instance.customerId,
  'sales_channel_id': instance.salesChannelId,
  'email': instance.email,
  'currency_code': instance.currencyCode,
  'display_id': instance.displayId,
  'shipping_address': instance.shippingAddress,
  'billing_address': instance.billingAddress,
  'items': instance.items,
  'shipping_methods': instance.shippingMethods,
  'payment_collections': instance.paymentCollections,
  'payment_status': _$StoreOrderPaymentStatusEnumMap[instance.paymentStatus]!,
  'fulfillments': instance.fulfillments,
  'fulfillment_status':
      _$StoreOrderFulfillmentStatusEnumMap[instance.fulfillmentStatus]!,
  'summary': instance.summary,
  'metadata': instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'original_item_total': instance.originalItemTotal,
  'original_item_subtotal': instance.originalItemSubtotal,
  'original_item_tax_total': instance.originalItemTaxTotal,
  'item_total': instance.itemTotal,
  'item_subtotal': instance.itemSubtotal,
  'item_tax_total': instance.itemTaxTotal,
  'original_total': instance.originalTotal,
  'original_subtotal': instance.originalSubtotal,
  'original_tax_total': instance.originalTaxTotal,
  'total': instance.total,
  'subtotal': instance.subtotal,
  'tax_total': instance.taxTotal,
  'discount_total': instance.discountTotal,
  'discount_tax_total': instance.discountTaxTotal,
  'gift_card_total': instance.giftCardTotal,
  'gift_card_tax_total': instance.giftCardTaxTotal,
  'shipping_total': instance.shippingTotal,
  'shipping_subtotal': instance.shippingSubtotal,
  'shipping_tax_total': instance.shippingTaxTotal,
  'original_shipping_total': instance.originalShippingTotal,
  'original_shipping_subtotal': instance.originalShippingSubtotal,
  'original_shipping_tax_total': instance.originalShippingTaxTotal,
  'customer': instance.customer,
  'transactions': instance.transactions,
  'status': instance.status,
  'credit_line_total': instance.creditLineTotal,
  'item_discount_total': instance.itemDiscountTotal,
  'shipping_discount_total': instance.shippingDiscountTotal,
  'custom_display_id': instance.customDisplayId,
};

const _$StoreOrderPaymentStatusEnumMap = {
  StoreOrderPaymentStatus.canceled: 'canceled',
  StoreOrderPaymentStatus.notPaid: 'not_paid',
  StoreOrderPaymentStatus.awaiting: 'awaiting',
  StoreOrderPaymentStatus.authorized: 'authorized',
  StoreOrderPaymentStatus.partiallyAuthorized: 'partially_authorized',
  StoreOrderPaymentStatus.captured: 'captured',
  StoreOrderPaymentStatus.partiallyCaptured: 'partially_captured',
  StoreOrderPaymentStatus.partiallyRefunded: 'partially_refunded',
  StoreOrderPaymentStatus.refunded: 'refunded',
  StoreOrderPaymentStatus.requiresAction: 'requires_action',
  StoreOrderPaymentStatus.$unknown: r'$unknown',
};

const _$StoreOrderFulfillmentStatusEnumMap = {
  StoreOrderFulfillmentStatus.canceled: 'canceled',
  StoreOrderFulfillmentStatus.notFulfilled: 'not_fulfilled',
  StoreOrderFulfillmentStatus.partiallyFulfilled: 'partially_fulfilled',
  StoreOrderFulfillmentStatus.fulfilled: 'fulfilled',
  StoreOrderFulfillmentStatus.partiallyShipped: 'partially_shipped',
  StoreOrderFulfillmentStatus.shipped: 'shipped',
  StoreOrderFulfillmentStatus.partiallyDelivered: 'partially_delivered',
  StoreOrderFulfillmentStatus.delivered: 'delivered',
  StoreOrderFulfillmentStatus.$unknown: r'$unknown',
};
