// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items8.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items8 _$Items8FromJson(Map<String, dynamic> json) => Items8(
  id: json['id'] as String,
  quantity: json['quantity'] as num,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  reasonId: json['reason_id'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$Items8ToJson(Items8 instance) => <String, dynamic>{
  'id': instance.id,
  'quantity': instance.quantity,
  'description': instance.description,
  'internal_note': instance.internalNote,
  'reason_id': instance.reasonId,
  'metadata': instance.metadata,
};
