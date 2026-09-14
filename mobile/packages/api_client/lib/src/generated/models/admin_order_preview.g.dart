// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_preview.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderPreview _$AdminOrderPreviewFromJson(
  Map<String, dynamic> json,
) => AdminOrderPreview(
  fulfillmentStatus: AdminOrderPreviewFulfillmentStatus.fromJson(
    json['fulfillment_status'] as String,
  ),
  orderChange: AdminOrderChange.fromJson(
    json['order_change'] as Map<String, dynamic>,
  ),
  items: (json['items'] as List<dynamic>)
      .map((e) => AdminOrderLinePreview.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingDiscountTotal: json['shipping_discount_total'] as num,
  currencyCode: json['currency_code'] as String,
  version: json['version'] as num,
  id: json['id'] as String,
  regionId: json['region_id'] as String,
  customerId: json['customer_id'] as String,
  salesChannelId: json['sales_channel_id'] as String,
  email: json['email'] as String,
  itemDiscountTotal: json['item_discount_total'] as num,
  creditLineTotal: json['credit_line_total'] as num,
  status: json['status'] as String,
  paymentCollections: (json['payment_collections'] as List<dynamic>)
      .map((e) => AdminPaymentCollection.fromJson(e as Map<String, dynamic>))
      .toList(),
  paymentStatus: AdminOrderPreviewPaymentStatus.fromJson(
    json['payment_status'] as String,
  ),
  originalShippingTaxTotal: json['original_shipping_tax_total'] as num,
  returnRequestedTotal: json['return_requested_total'] as num,
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
  subtotal: json['subtotal'] as num,
  taxTotal: json['tax_total'] as num,
  shippingTaxTotal: json['shipping_tax_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  giftCardTotal: json['gift_card_total'] as num,
  giftCardTaxTotal: json['gift_card_tax_total'] as num,
  shippingTotal: json['shipping_total'] as num,
  shippingSubtotal: json['shipping_subtotal'] as num,
  discountTotal: json['discount_total'] as num,
  metadata: json['metadata'],
  transactions: (json['transactions'] as List<dynamic>?)
      ?.map((e) => BaseOrderTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  fulfillments: (json['fulfillments'] as List<dynamic>?)
      ?.map((e) => AdminOrderFulfillment.fromJson(e as Map<String, dynamic>))
      .toList(),
  customer: json['customer'] == null
      ? null
      : AdminCustomer.fromJson(json['customer'] as Map<String, dynamic>),
  salesChannel: json['sales_channel'] == null
      ? null
      : AdminSalesChannel.fromJson(
          json['sales_channel'] as Map<String, dynamic>,
        ),
  billingAddress: json['billing_address'] == null
      ? null
      : AdminOrderAddress.fromJson(
          json['billing_address'] as Map<String, dynamic>,
        ),
  region: json['region'] == null
      ? null
      : AdminRegion.fromJson(json['region'] as Map<String, dynamic>),
  creditLines: (json['credit_lines'] as List<dynamic>?)
      ?.map((e) => OrderCreditLine.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingAddress: json['shipping_address'] == null
      ? null
      : AdminOrderAddress.fromJson(
          json['shipping_address'] as Map<String, dynamic>,
        ),
  displayId: json['display_id'] as num?,
  shippingMethods: (json['shipping_methods'] as List<dynamic>?)
      ?.map(
        (e) => AdminOrderPreviewShippingMethods.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  customDisplayId: json['custom_display_id'] as String?,
);

Map<String, dynamic> _$AdminOrderPreviewToJson(
  AdminOrderPreview instance,
) => <String, dynamic>{
  'return_requested_total': instance.returnRequestedTotal,
  'order_change': instance.orderChange,
  'items': instance.items,
  'shipping_methods': ?instance.shippingMethods,
  'currency_code': instance.currencyCode,
  'version': instance.version,
  'id': instance.id,
  'region_id': instance.regionId,
  'customer_id': instance.customerId,
  'sales_channel_id': instance.salesChannelId,
  'email': instance.email,
  'display_id': ?instance.displayId,
  'shipping_address': ?instance.shippingAddress,
  'billing_address': ?instance.billingAddress,
  'payment_collections': instance.paymentCollections,
  'payment_status':
      _$AdminOrderPreviewPaymentStatusEnumMap[instance.paymentStatus]!,
  'fulfillments': ?instance.fulfillments,
  'fulfillment_status':
      _$AdminOrderPreviewFulfillmentStatusEnumMap[instance.fulfillmentStatus]!,
  'transactions': ?instance.transactions,
  'summary': instance.summary,
  'metadata': ?instance.metadata,
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
  'customer': ?instance.customer,
  'sales_channel': ?instance.salesChannel,
  'status': instance.status,
  'region': ?instance.region,
  'credit_lines': ?instance.creditLines,
  'credit_line_total': instance.creditLineTotal,
  'item_discount_total': instance.itemDiscountTotal,
  'shipping_discount_total': instance.shippingDiscountTotal,
  'custom_display_id': ?instance.customDisplayId,
};

const _$AdminOrderPreviewPaymentStatusEnumMap = {
  AdminOrderPreviewPaymentStatus.canceled: 'canceled',
  AdminOrderPreviewPaymentStatus.notPaid: 'not_paid',
  AdminOrderPreviewPaymentStatus.awaiting: 'awaiting',
  AdminOrderPreviewPaymentStatus.authorized: 'authorized',
  AdminOrderPreviewPaymentStatus.partiallyAuthorized: 'partially_authorized',
  AdminOrderPreviewPaymentStatus.captured: 'captured',
  AdminOrderPreviewPaymentStatus.partiallyCaptured: 'partially_captured',
  AdminOrderPreviewPaymentStatus.partiallyRefunded: 'partially_refunded',
  AdminOrderPreviewPaymentStatus.refunded: 'refunded',
  AdminOrderPreviewPaymentStatus.requiresAction: 'requires_action',
  AdminOrderPreviewPaymentStatus.$unknown: r'$unknown',
};

const _$AdminOrderPreviewFulfillmentStatusEnumMap = {
  AdminOrderPreviewFulfillmentStatus.canceled: 'canceled',
  AdminOrderPreviewFulfillmentStatus.notFulfilled: 'not_fulfilled',
  AdminOrderPreviewFulfillmentStatus.partiallyFulfilled: 'partially_fulfilled',
  AdminOrderPreviewFulfillmentStatus.fulfilled: 'fulfilled',
  AdminOrderPreviewFulfillmentStatus.partiallyShipped: 'partially_shipped',
  AdminOrderPreviewFulfillmentStatus.shipped: 'shipped',
  AdminOrderPreviewFulfillmentStatus.partiallyDelivered: 'partially_delivered',
  AdminOrderPreviewFulfillmentStatus.delivered: 'delivered',
  AdminOrderPreviewFulfillmentStatus.$unknown: r'$unknown',
};
