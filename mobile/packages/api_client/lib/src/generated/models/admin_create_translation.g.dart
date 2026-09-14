// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_translation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateTranslation _$AdminCreateTranslationFromJson(
  Map<String, dynamic> json,
) => AdminCreateTranslation(
  reference: json['reference'] as String,
  referenceId: json['reference_id'] as String,
  localeCode: json['locale_code'] as String,
  translations: json['translations'],
);

Map<String, dynamic> _$AdminCreateTranslationToJson(
  AdminCreateTranslation instance,
) => <String, dynamic>{
  'reference': instance.reference,
  'reference_id': instance.referenceId,
  'locale_code': instance.localeCode,
  'translations': ?instance.translations,
};
