// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_tag.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductTag _$AdminProductTagFromJson(Map<String, dynamic> json) =>
    AdminProductTag(
      id: json['id'] as String,
      value: json['value'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      metadata: json['metadata'],
      translations: (json['translations'] as List<dynamic>?)
          ?.map((e) => AdminTranslation.fromJson(e as Map<String, dynamic>))
          .toList(),
      externalId: json['external_id'] as String?,
    );

Map<String, dynamic> _$AdminProductTagToJson(AdminProductTag instance) =>
    <String, dynamic>{
      'id': instance.id,
      'value': instance.value,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt?.toIso8601String(),
      'metadata': instance.metadata,
      'translations': instance.translations,
      'external_id': instance.externalId,
    };
