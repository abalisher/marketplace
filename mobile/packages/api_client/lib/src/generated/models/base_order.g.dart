// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseOrder _$BaseOrderFromJson(Map<String, dynamic> json) => BaseOrder(
  fulfillmentStatus: BaseOrderFulfillmentStatus.fromJson(
    json['fulfillment_status'] as String,
  ),
  shippingDiscountTotal: json['shipping_discount_total'] as num,
  itemDiscountTotal: json['item_discount_total'] as num,
  creditLineTotal: json['credit_line_total'] as num,
  id: json['id'] as String,
  version: json['version'] as num,
  regionId: json['region_id'] as String,
  customerId: json['customer_id'] as String,
  salesChannelId: json['sales_channel_id'] as String,
  email: json['email'] as String,
  currencyCode: json['currency_code'] as String,
  status: json['status'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => BaseOrderLineItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingMethods: (json['shipping_methods'] as List<dynamic>)
      .map((e) => BaseOrderShippingMethod.fromJson(e as Map<String, dynamic>))
      .toList(),
  paymentStatus: BaseOrderPaymentStatus.fromJson(
    json['payment_status'] as String,
  ),
  originalShippingTaxTotal: json['original_shipping_tax_total'] as num,
  originalShippingSubtotal: json['original_shipping_subtotal'] as num,
  summary: BaseOrderSummary.fromJson(json['summary'] as Map<String, dynamic>),
  originalShippingTotal: json['original_shipping_total'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  originalItemTotal: json['original_item_total'] as num,
  originalItemSubtotal: json['original_item_subtotal'] as num,
  originalItemTaxTotal: json['original_item_tax_total'] as num,
  itemTotal: json['item_total'] as num,
  itemSubtotal: json['item_subtotal'] as num,
  itemTaxTotal: json['item_tax_total'] as num,
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  total: json['total'] as num,
  shippingTaxTotal: json['shipping_tax_total'] as num,
  taxTotal: json['tax_total'] as num,
  discountTotal: json['discount_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  giftCardTotal: json['gift_card_total'] as num,
  giftCardTaxTotal: json['gift_card_tax_total'] as num,
  shippingTotal: json['shipping_total'] as num,
  shippingSubtotal: json['shipping_subtotal'] as num,
  subtotal: json['subtotal'] as num,
  metadata: json['metadata'],
  transactions: (json['transactions'] as List<dynamic>?)
      ?.map((e) => BaseOrderTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  paymentCollections: (json['payment_collections'] as List<dynamic>?)
      ?.map((e) => BasePaymentCollection.fromJson(e as Map<String, dynamic>))
      .toList(),
  displayId: json['display_id'] as num?,
  billingAddress: json['billing_address'] == null
      ? null
      : BaseOrderAddress.fromJson(
          json['billing_address'] as Map<String, dynamic>,
        ),
  shippingAddress: json['shipping_address'] == null
      ? null
      : BaseOrderAddress.fromJson(
          json['shipping_address'] as Map<String, dynamic>,
        ),
  fulfillments: (json['fulfillments'] as List<dynamic>?)
      ?.map((e) => BaseOrderFulfillment.fromJson(e as Map<String, dynamic>))
      .toList(),
  customDisplayId: json['custom_display_id'] as String?,
);

Map<String, dynamic> _$BaseOrderToJson(BaseOrder instance) => <String, dynamic>{
  'payment_collections': instance.paymentCollections,
  'fulfillments': instance.fulfillments,
  'shipping_address': instance.shippingAddress,
  'billing_address': instance.billingAddress,
  'id': instance.id,
  'version': instance.version,
  'region_id': instance.regionId,
  'customer_id': instance.customerId,
  'sales_channel_id': instance.salesChannelId,
  'email': instance.email,
  'currency_code': instance.currencyCode,
  'display_id': instance.displayId,
  'items': instance.items,
  'shipping_methods': instance.shippingMethods,
  'payment_status': _$BaseOrderPaymentStatusEnumMap[instance.paymentStatus]!,
  'fulfillment_status':
      _$BaseOrderFulfillmentStatusEnumMap[instance.fulfillmentStatus]!,
  'transactions': instance.transactions,
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
  'status': instance.status,
  'credit_line_total': instance.creditLineTotal,
  'item_discount_total': instance.itemDiscountTotal,
  'shipping_discount_total': instance.shippingDiscountTotal,
  'custom_display_id': instance.customDisplayId,
};

const _$BaseOrderPaymentStatusEnumMap = {
  BaseOrderPaymentStatus.canceled: 'canceled',
  BaseOrderPaymentStatus.notPaid: 'not_paid',
  BaseOrderPaymentStatus.awaiting: 'awaiting',
  BaseOrderPaymentStatus.authorized: 'authorized',
  BaseOrderPaymentStatus.partiallyAuthorized: 'partially_authorized',
  BaseOrderPaymentStatus.captured: 'captured',
  BaseOrderPaymentStatus.partiallyCaptured: 'partially_captured',
  BaseOrderPaymentStatus.partiallyRefunded: 'partially_refunded',
  BaseOrderPaymentStatus.refunded: 'refunded',
  BaseOrderPaymentStatus.requiresAction: 'requires_action',
  BaseOrderPaymentStatus.$unknown: r'$unknown',
};

const _$BaseOrderFulfillmentStatusEnumMap = {
  BaseOrderFulfillmentStatus.canceled: 'canceled',
  BaseOrderFulfillmentStatus.notFulfilled: 'not_fulfilled',
  BaseOrderFulfillmentStatus.partiallyFulfilled: 'partially_fulfilled',
  BaseOrderFulfillmentStatus.fulfilled: 'fulfilled',
  BaseOrderFulfillmentStatus.partiallyShipped: 'partially_shipped',
  BaseOrderFulfillmentStatus.shipped: 'shipped',
  BaseOrderFulfillmentStatus.partiallyDelivered: 'partially_delivered',
  BaseOrderFulfillmentStatus.delivered: 'delivered',
  BaseOrderFulfillmentStatus.$unknown: r'$unknown',
};
