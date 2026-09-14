// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_translation_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateTranslationSettings _$AdminCreateTranslationSettingsFromJson(
  Map<String, dynamic> json,
) => AdminCreateTranslationSettings(
  entityType: json['entity_type'] as String,
  fields: (json['fields'] as List<dynamic>).map((e) => e as String).toList(),
  isActive: json['is_active'] as bool?,
);

Map<String, dynamic> _$AdminCreateTranslationSettingsToJson(
  AdminCreateTranslationSettings instance,
) => <String, dynamic>{
  'entity_type': instance.entityType,
  'fields': instance.fields,
  'is_active': ?instance.isActive,
};
