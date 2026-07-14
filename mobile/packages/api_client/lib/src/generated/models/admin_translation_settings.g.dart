// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_translation_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTranslationSettings _$AdminTranslationSettingsFromJson(
  Map<String, dynamic> json,
) => AdminTranslationSettings(
  id: json['id'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: DateTime.parse(json['deleted_at'] as String),
  entityType: json['entity_type'] as String,
  fields: (json['fields'] as List<dynamic>).map((e) => e as String).toList(),
  isActive: json['is_active'] as bool,
);

Map<String, dynamic> _$AdminTranslationSettingsToJson(
  AdminTranslationSettings instance,
) => <String, dynamic>{
  'id': instance.id,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': instance.deletedAt.toIso8601String(),
  'entity_type': instance.entityType,
  'fields': instance.fields,
  'is_active': instance.isActive,
};
