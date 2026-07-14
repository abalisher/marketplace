// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_line_item_adjustment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderLineItemAdjustment _$OrderLineItemAdjustmentFromJson(
  Map<String, dynamic> json,
) => OrderLineItemAdjustment(
  item: json['item'],
  itemId: json['item_id'] as String,
  id: json['id'] as String,
  amount: json['amount'] as num,
  orderId: json['order_id'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  version: json['version'] as num,
  code: json['code'] as String?,
  description: json['description'] as String?,
  promotionId: json['promotion_id'] as String?,
  providerId: json['provider_id'] as String?,
);

Map<String, dynamic> _$OrderLineItemAdjustmentToJson(
  OrderLineItemAdjustment instance,
) => <String, dynamic>{
  'item': instance.item,
  'item_id': instance.itemId,
  'id': instance.id,
  'code': instance.code,
  'amount': instance.amount,
  'order_id': instance.orderId,
  'description': instance.description,
  'promotion_id': instance.promotionId,
  'provider_id': instance.providerId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'version': instance.version,
};
