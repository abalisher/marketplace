// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items9.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items9 _$Items9FromJson(Map<String, dynamic> json) => Items9(
  id: json['id'] as String,
  quantity: json['quantity'] as num,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$Items9ToJson(Items9 instance) => <String, dynamic>{
  'id': instance.id,
  'quantity': instance.quantity,
  'description': instance.description,
  'internal_note': instance.internalNote,
};
