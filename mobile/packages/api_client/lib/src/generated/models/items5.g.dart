// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items5.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items5 _$Items5FromJson(Map<String, dynamic> json) => Items5(
  variantId: json['variant_id'] as String,
  quantity: json['quantity'] as num,
  unitPrice: json['unit_price'] as num?,
  internalNote: json['internal_note'] as String?,
  allowBackorder: json['allow_backorder'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$Items5ToJson(Items5 instance) => <String, dynamic>{
  'variant_id': instance.variantId,
  'quantity': instance.quantity,
  'unit_price': instance.unitPrice,
  'internal_note': instance.internalNote,
  'allow_backorder': instance.allowBackorder,
  'metadata': instance.metadata,
};
