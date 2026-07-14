// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items3.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items3 _$Items3FromJson(Map<String, dynamic> json) => Items3(
  quantity: json['quantity'] as num,
  variantId: json['variant_id'] as String?,
  title: json['title'] as String?,
  unitPrice: json['unit_price'] as num?,
  compareAtUnitPrice: json['compare_at_unit_price'] as num?,
  internalNote: json['internal_note'] as String?,
  allowBackorder: json['allow_backorder'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$Items3ToJson(Items3 instance) => <String, dynamic>{
  'quantity': instance.quantity,
  'variant_id': instance.variantId,
  'title': instance.title,
  'unit_price': instance.unitPrice,
  'compare_at_unit_price': instance.compareAtUnitPrice,
  'internal_note': instance.internalNote,
  'allow_backorder': instance.allowBackorder,
  'metadata': instance.metadata,
};
