// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_shipping_method.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderShippingMethod _$StoreOrderShippingMethodFromJson(
  Map<String, dynamic> json,
) => StoreOrderShippingMethod(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  name: json['name'] as String,
  amount: json['amount'] as num,
  isTaxInclusive: json['is_tax_inclusive'] as bool,
  shippingOptionId: json['shipping_option_id'] as String,
  data: json['data'],
  metadata: json['metadata'],
  originalTotal: json['original_total'] as num,
  originalSubtotal: json['original_subtotal'] as num,
  originalTaxTotal: json['original_tax_total'] as num,
  total: json['total'] as num,
  subtotal: json['subtotal'] as num,
  taxTotal: json['tax_total'] as num,
  discountTotal: json['discount_total'] as num,
  discountTaxTotal: json['discount_tax_total'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  taxLines: (json['tax_lines'] as List<dynamic>?)
      ?.map(
        (e) => StoreOrderShippingMethodTaxLines.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  adjustments: (json['adjustments'] as List<dynamic>?)
      ?.map(
        (e) => StoreOrderShippingMethodAdjustments.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  detail: json['detail'] == null
      ? null
      : StoreOrderShippingMethodDetail.fromJson(
          json['detail'] as Map<String, dynamic>,
        ),
  description: json['description'] as String?,
);

Map<String, dynamic> _$StoreOrderShippingMethodToJson(
  StoreOrderShippingMethod instance,
) => <String, dynamic>{
  'tax_lines': ?instance.taxLines,
  'adjustments': ?instance.adjustments,
  'detail': ?instance.detail,
  'id': instance.id,
  'order_id': instance.orderId,
  'name': instance.name,
  'description': ?instance.description,
  'amount': instance.amount,
  'is_tax_inclusive': instance.isTaxInclusive,
  'shipping_option_id': instance.shippingOptionId,
  'data': ?instance.data,
  'metadata': ?instance.metadata,
  'original_total': instance.originalTotal,
  'original_subtotal': instance.originalSubtotal,
  'original_tax_total': instance.originalTaxTotal,
  'total': instance.total,
  'subtotal': instance.subtotal,
  'tax_total': instance.taxTotal,
  'discount_total': instance.discountTotal,
  'discount_tax_total': instance.discountTaxTotal,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
