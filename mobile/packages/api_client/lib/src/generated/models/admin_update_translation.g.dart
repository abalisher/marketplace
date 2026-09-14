// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_translation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateTranslation _$AdminUpdateTranslationFromJson(
  Map<String, dynamic> json,
) => AdminUpdateTranslation(
  id: json['id'] as String,
  reference: json['reference'] as String?,
  referenceId: json['reference_id'] as String?,
  localeCode: json['locale_code'] as String?,
  translations: json['translations'],
);

Map<String, dynamic> _$AdminUpdateTranslationToJson(
  AdminUpdateTranslation instance,
) => <String, dynamic>{
  'id': instance.id,
  'reference': ?instance.reference,
  'reference_id': ?instance.referenceId,
  'locale_code': ?instance.localeCode,
  'translations': ?instance.translations,
};
