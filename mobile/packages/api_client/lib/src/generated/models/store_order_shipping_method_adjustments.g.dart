// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_shipping_method_adjustments.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderShippingMethodAdjustments
_$StoreOrderShippingMethodAdjustmentsFromJson(Map<String, dynamic> json) =>
    StoreOrderShippingMethodAdjustments(
      shippingMethod: json['shipping_method'],
      shippingMethodId: json['shipping_method_id'] as String,
      id: json['id'] as String,
      amount: json['amount'] as num,
      orderId: json['order_id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      code: json['code'] as String?,
      description: json['description'] as String?,
      promotionId: json['promotion_id'] as String?,
      providerId: json['provider_id'] as String?,
    );

Map<String, dynamic> _$StoreOrderShippingMethodAdjustmentsToJson(
  StoreOrderShippingMethodAdjustments instance,
) => <String, dynamic>{
  'shipping_method': instance.shippingMethod,
  'shipping_method_id': instance.shippingMethodId,
  'id': instance.id,
  'code': instance.code,
  'amount': instance.amount,
  'order_id': instance.orderId,
  'description': instance.description,
  'promotion_id': instance.promotionId,
  'provider_id': instance.providerId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
