// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_shipping_method_detail.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderShippingMethodDetail _$StoreOrderShippingMethodDetailFromJson(
  Map<String, dynamic> json,
) => StoreOrderShippingMethodDetail(
  id: json['id'] as String,
  shippingMethodId: json['shipping_method_id'] as String,
  shippingMethod: json['shipping_method'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  claimId: json['claim_id'] as String?,
  exchangeId: json['exchange_id'] as String?,
  returnId: json['return_id'] as String?,
);

Map<String, dynamic> _$StoreOrderShippingMethodDetailToJson(
  StoreOrderShippingMethodDetail instance,
) => <String, dynamic>{
  'id': instance.id,
  'shipping_method_id': instance.shippingMethodId,
  'shipping_method': instance.shippingMethod,
  'claim_id': instance.claimId,
  'exchange_id': instance.exchangeId,
  'return_id': instance.returnId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
