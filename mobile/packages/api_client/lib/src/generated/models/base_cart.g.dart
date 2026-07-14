// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_cart.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseCart _$BaseCartFromJson(Map<String, dynamic> json) => BaseCart(
  itemTotal: json['item_total'] as num,
  originalShippingSubtotal: json['original_shipping_subtotal'] as num,
  originalShippingTotal: json['original_shipping_total'] as num,
  shippingTaxTotal: json['shipping_tax_total'] as num,
  shippingSubtotal: json['shipping_subtotal'] as num,
  shippingTotal: json['shipping_total'] as num,
  currencyCode: json['currency_code'] as String,
  giftCardTotal: json['gift_card_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  discountTotal: json['discount_total'] as num,
  taxTotal: json['tax_total'] as num,
  subtotal: json['subtotal'] as num,
  id: json['id'] as String,
  originalShippingTaxTotal: json['original_shipping_tax_total'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  originalItemTotal: json['original_item_total'] as num,
  originalItemSubtotal: json['original_item_subtotal'] as num,
  originalItemTaxTotal: json['original_item_tax_total'] as num,
  total: json['total'] as num,
  itemSubtotal: json['item_subtotal'] as num,
  itemTaxTotal: json['item_tax_total'] as num,
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  giftCardTaxTotal: json['gift_card_tax_total'] as num,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  paymentCollection: json['payment_collection'] == null
      ? null
      : BasePaymentCollection.fromJson(
          json['payment_collection'] as Map<String, dynamic>,
        ),
  shippingMethods: (json['shipping_methods'] as List<dynamic>?)
      ?.map((e) => BaseCartShippingMethod.fromJson(e as Map<String, dynamic>))
      .toList(),
  items: json['items'] as List<dynamic>?,
  billingAddress: json['billing_address'],
  shippingAddress: json['shipping_address'],
  metadata: json['metadata'],
  email: json['email'] as String?,
  salesChannelId: json['sales_channel_id'] as String?,
  customerId: json['customer_id'] as String?,
  regionId: json['region_id'] as String?,
  region: json['region'] == null
      ? null
      : BaseRegion.fromJson(json['region'] as Map<String, dynamic>),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
);

Map<String, dynamic> _$BaseCartToJson(BaseCart instance) => <String, dynamic>{
  'id': instance.id,
  'region': instance.region,
  'region_id': instance.regionId,
  'customer_id': instance.customerId,
  'sales_channel_id': instance.salesChannelId,
  'email': instance.email,
  'currency_code': instance.currencyCode,
  'shipping_address': instance.shippingAddress,
  'billing_address': instance.billingAddress,
  'items': instance.items,
  'shipping_methods': instance.shippingMethods,
  'payment_collection': instance.paymentCollection,
  'metadata': instance.metadata,
  'created_at': instance.createdAt?.toIso8601String(),
  'updated_at': instance.updatedAt?.toIso8601String(),
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
};
