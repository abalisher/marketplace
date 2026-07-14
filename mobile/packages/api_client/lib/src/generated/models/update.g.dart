// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Update _$UpdateFromJson(Map<String, dynamic> json) => Update(
  id: json['id'] as String,
  label: json['label'] as String?,
  description: json['description'] as String?,
);

Map<String, dynamic> _$UpdateToJson(Update instance) => <String, dynamic>{
  'id': instance.id,
  'label': instance.label,
  'description': instance.description,
};
