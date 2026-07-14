// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_translation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTranslation _$AdminTranslationFromJson(Map<String, dynamic> json) =>
    AdminTranslation(
      id: json['id'] as String,
      referenceId: json['reference_id'] as String,
      reference: json['reference'] as String,
      localeCode: json['locale_code'] as String,
      translations: json['translations'],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: DateTime.parse(json['deleted_at'] as String),
    );

Map<String, dynamic> _$AdminTranslationToJson(AdminTranslation instance) =>
    <String, dynamic>{
      'id': instance.id,
      'reference_id': instance.referenceId,
      'reference': instance.reference,
      'locale_code': instance.localeCode,
      'translations': instance.translations,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt.toIso8601String(),
    };
