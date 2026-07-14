// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_translation_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateTranslationSettings _$AdminUpdateTranslationSettingsFromJson(
  Map<String, dynamic> json,
) => AdminUpdateTranslationSettings(
  id: json['id'] as String,
  entityType: json['entity_type'] as String?,
  fields: (json['fields'] as List<dynamic>?)?.map((e) => e as String).toList(),
  isActive: json['is_active'] as bool?,
);

Map<String, dynamic> _$AdminUpdateTranslationSettingsToJson(
  AdminUpdateTranslationSettings instance,
) => <String, dynamic>{
  'id': instance.id,
  'entity_type': instance.entityType,
  'fields': instance.fields,
  'is_active': instance.isActive,
};
