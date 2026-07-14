// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items2 _$Items2FromJson(Map<String, dynamic> json) => Items2(
  quantity: json['quantity'] as num,
  variantId: json['variant_id'] as String,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
  unitPrice: json['unit_price'] as num?,
);

Map<String, dynamic> _$Items2ToJson(Items2 instance) => <String, dynamic>{
  'quantity': instance.quantity,
  'internal_note': instance.internalNote,
  'metadata': instance.metadata,
  'variant_id': instance.variantId,
  'unit_price': instance.unitPrice,
};
