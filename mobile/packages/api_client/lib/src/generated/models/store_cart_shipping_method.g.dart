// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_cart_shipping_method.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartShippingMethod _$StoreCartShippingMethodFromJson(
  Map<String, dynamic> json,
) => StoreCartShippingMethod(
  id: json['id'] as String,
  cartId: json['cart_id'] as String,
  name: json['name'] as String,
  amount: json['amount'] as num,
  isTaxInclusive: json['is_tax_inclusive'] as bool,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  description: json['description'] as String?,
  shippingOptionId: json['shipping_option_id'] as String?,
  data: json['data'],
  metadata: json['metadata'],
  taxLines: (json['tax_lines'] as List<dynamic>?)
      ?.map(
        (e) =>
            StoreCartShippingMethodTaxLines.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  adjustments: (json['adjustments'] as List<dynamic>?)
      ?.map(
        (e) => StoreCartShippingMethodAdjustments.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  originalTotal: json['original_total'] as num?,
  originalSubtotal: json['original_subtotal'] as num?,
  originalTaxTotal: json['original_tax_total'] as num?,
  total: json['total'] as num?,
  subtotal: json['subtotal'] as num?,
  taxTotal: json['tax_total'] as num?,
  discountTotal: json['discount_total'] as num?,
  discountTaxTotal: json['discount_tax_total'] as num?,
);

Map<String, dynamic> _$StoreCartShippingMethodToJson(
  StoreCartShippingMethod instance,
) => <String, dynamic>{
  'id': instance.id,
  'cart_id': instance.cartId,
  'name': instance.name,
  'description': instance.description,
  'amount': instance.amount,
  'is_tax_inclusive': instance.isTaxInclusive,
  'shipping_option_id': instance.shippingOptionId,
  'data': instance.data,
  'metadata': instance.metadata,
  'tax_lines': instance.taxLines,
  'adjustments': instance.adjustments,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'original_total': instance.originalTotal,
  'original_subtotal': instance.originalSubtotal,
  'original_tax_total': instance.originalTaxTotal,
  'total': instance.total,
  'subtotal': instance.subtotal,
  'tax_total': instance.taxTotal,
  'discount_total': instance.discountTotal,
  'discount_tax_total': instance.discountTaxTotal,
};
