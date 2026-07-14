// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_cart_line_item_adjustments.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartLineItemAdjustments _$StoreCartLineItemAdjustmentsFromJson(
  Map<String, dynamic> json,
) => StoreCartLineItemAdjustments(
  item: json['item'],
  itemId: json['item_id'] as String,
  id: json['id'] as String,
  amount: json['amount'] as num,
  cartId: json['cart_id'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  code: json['code'] as String?,
  description: json['description'] as String?,
  promotionId: json['promotion_id'] as String?,
  providerId: json['provider_id'] as String?,
);

Map<String, dynamic> _$StoreCartLineItemAdjustmentsToJson(
  StoreCartLineItemAdjustments instance,
) => <String, dynamic>{
  'item': instance.item,
  'item_id': instance.itemId,
  'id': instance.id,
  'code': instance.code,
  'amount': instance.amount,
  'cart_id': instance.cartId,
  'description': instance.description,
  'promotion_id': instance.promotionId,
  'provider_id': instance.providerId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
