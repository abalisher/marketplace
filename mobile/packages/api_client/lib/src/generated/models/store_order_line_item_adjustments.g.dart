// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_line_item_adjustments.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderLineItemAdjustments _$StoreOrderLineItemAdjustmentsFromJson(
  Map<String, dynamic> json,
) => StoreOrderLineItemAdjustments(
  item: json['item'],
  itemId: json['item_id'] as String,
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

Map<String, dynamic> _$StoreOrderLineItemAdjustmentsToJson(
  StoreOrderLineItemAdjustments instance,
) => <String, dynamic>{
  'item': ?instance.item,
  'item_id': instance.itemId,
  'id': instance.id,
  'code': ?instance.code,
  'amount': instance.amount,
  'order_id': instance.orderId,
  'description': ?instance.description,
  'promotion_id': ?instance.promotionId,
  'provider_id': ?instance.providerId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
