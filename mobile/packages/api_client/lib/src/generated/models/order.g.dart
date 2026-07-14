// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Order _$OrderFromJson(Map<String, dynamic> json) => Order(
  createdAt: DateTime.parse(json['created_at'] as String),
  version: json['version'] as num,
  shippingDiscountTotal: json['shipping_discount_total'] as num,
  status: OrderStatus.fromJson(json['status'] as String),
  itemDiscountTotal: json['item_discount_total'] as num,
  creditLineTotal: json['credit_line_total'] as num,
  displayId: json['display_id'] as num,
  originalShippingTaxTotal: json['original_shipping_tax_total'] as num,
  currencyCode: json['currency_code'] as String,
  originalShippingSubtotal: json['original_shipping_subtotal'] as num,
  originalShippingTotal: json['original_shipping_total'] as num,
  shippingTaxTotal: json['shipping_tax_total'] as num,
  shippingSubtotal: json['shipping_subtotal'] as num,
  shippingTotal: json['shipping_total'] as num,
  giftCardTaxTotal: json['gift_card_tax_total'] as num,
  giftCardTotal: json['gift_card_total'] as num,
  discountTotal: json['discount_total'] as num,
  id: json['id'] as String,
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
  discountSubtotal: json['discount_subtotal'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  locale: json['locale'] as String?,
  metadata: json['metadata'],
  summary: json['summary'] == null
      ? null
      : Summary2.fromJson(json['summary'] as Map<String, dynamic>),
  transactions: (json['transactions'] as List<dynamic>?)
      ?.map((e) => OrderTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingMethods: (json['shipping_methods'] as List<dynamic>?)
      ?.map((e) => OrderShippingMethod.fromJson(e as Map<String, dynamic>))
      .toList(),
  items: (json['items'] as List<dynamic>?)
      ?.map((e) => OrderLineItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  billingAddress: json['billing_address'] == null
      ? null
      : OrderAddress.fromJson(json['billing_address'] as Map<String, dynamic>),
  shippingAddress: json['shipping_address'] == null
      ? null
      : OrderAddress.fromJson(json['shipping_address'] as Map<String, dynamic>),
  email: json['email'] as String?,
  salesChannelId: json['sales_channel_id'] as String?,
  creditLines: (json['credit_lines'] as List<dynamic>?)
      ?.map((e) => OrderCreditLine.fromJson(e as Map<String, dynamic>))
      .toList(),
  isDraftOrder: json['is_draft_order'] as bool?,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  customerId: json['customer_id'] as String?,
  regionId: json['region_id'] as String?,
  orderChange: json['order_change'],
  customDisplayId: json['custom_display_id'] as String?,
  canceledAt: json['canceled_at'] == null
      ? null
      : DateTime.parse(json['canceled_at'] as String),
);

Map<String, dynamic> _$OrderToJson(Order instance) => <String, dynamic>{
  'id': instance.id,
  'version': instance.version,
  'order_change': instance.orderChange,
  'status': _$OrderStatusEnumMap[instance.status]!,
  'region_id': instance.regionId,
  'customer_id': instance.customerId,
  'sales_channel_id': instance.salesChannelId,
  'email': instance.email,
  'currency_code': instance.currencyCode,
  'shipping_address': instance.shippingAddress,
  'billing_address': instance.billingAddress,
  'items': instance.items,
  'shipping_methods': instance.shippingMethods,
  'transactions': instance.transactions,
  'summary': instance.summary,
  'metadata': instance.metadata,
  'canceled_at': instance.canceledAt?.toIso8601String(),
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
  'discount_subtotal': instance.discountSubtotal,
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
  'display_id': instance.displayId,
  'credit_lines': instance.creditLines,
  'is_draft_order': instance.isDraftOrder,
  'deleted_at': instance.deletedAt?.toIso8601String(),
  'credit_line_total': instance.creditLineTotal,
  'item_discount_total': instance.itemDiscountTotal,
  'shipping_discount_total': instance.shippingDiscountTotal,
  'custom_display_id': instance.customDisplayId,
  'locale': instance.locale,
};

const _$OrderStatusEnumMap = {
  OrderStatus.canceled: 'canceled',
  OrderStatus.requiresAction: 'requires_action',
  OrderStatus.pending: 'pending',
  OrderStatus.completed: 'completed',
  OrderStatus.draft: 'draft',
  OrderStatus.archived: 'archived',
  OrderStatus.$unknown: r'$unknown',
};
