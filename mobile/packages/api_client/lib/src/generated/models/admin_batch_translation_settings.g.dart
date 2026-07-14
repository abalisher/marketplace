// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_translation_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchTranslationSettings _$AdminBatchTranslationSettingsFromJson(
  Map<String, dynamic> json,
) => AdminBatchTranslationSettings(
  create: (json['create'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminCreateTranslationSettings.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  update: (json['update'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminUpdateTranslationSettings.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  delete: (json['delete'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchTranslationSettingsToJson(
  AdminBatchTranslationSettings instance,
) => <String, dynamic>{
  'create': instance.create,
  'update': instance.update,
  'delete': instance.delete,
};
