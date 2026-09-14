// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_cart_line_item_tax_lines.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartLineItemTaxLines _$StoreCartLineItemTaxLinesFromJson(
  Map<String, dynamic> json,
) => StoreCartLineItemTaxLines(
  item: json['item'],
  itemId: json['item_id'] as String,
  total: json['total'] as num,
  subtotal: json['subtotal'] as num,
  id: json['id'] as String,
  code: json['code'] as String,
  rate: json['rate'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  description: json['description'] as String?,
  taxRateId: json['tax_rate_id'] as String?,
  providerId: json['provider_id'] as String?,
);

Map<String, dynamic> _$StoreCartLineItemTaxLinesToJson(
  StoreCartLineItemTaxLines instance,
) => <String, dynamic>{
  'item': ?instance.item,
  'item_id': instance.itemId,
  'total': instance.total,
  'subtotal': instance.subtotal,
  'id': instance.id,
  'description': ?instance.description,
  'tax_rate_id': ?instance.taxRateId,
  'code': instance.code,
  'rate': instance.rate,
  'provider_id': ?instance.providerId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
