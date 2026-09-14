// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items7.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items7 _$Items7FromJson(Map<String, dynamic> json) => Items7(
  variantId: json['variant_id'] as String,
  quantity: json['quantity'] as num,
  unitPrice: json['unit_price'] as num?,
  internalNote: json['internal_note'] as String?,
  allowBackorder: json['allow_backorder'] as bool?,
  metadata: json['metadata'],
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
);

Map<String, dynamic> _$Items7ToJson(Items7 instance) => <String, dynamic>{
  'variant_id': instance.variantId,
  'quantity': instance.quantity,
  'unit_price': ?instance.unitPrice,
  'internal_note': ?instance.internalNote,
  'allow_backorder': ?instance.allowBackorder,
  'metadata': ?instance.metadata,
  'compare_at_unit_price': ?instance.compareAtUnitPrice,
};
