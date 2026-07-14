// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_collection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCollection _$AdminCollectionFromJson(Map<String, dynamic> json) =>
    AdminCollection(
      id: json['id'] as String,
      title: json['title'] as String,
      handle: json['handle'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: DateTime.parse(json['deleted_at'] as String),
      metadata: json['metadata'],
      products: (json['products'] as List<dynamic>?)
          ?.map((e) => BaseProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
      translations: (json['translations'] as List<dynamic>?)
          ?.map((e) => AdminTranslation.fromJson(e as Map<String, dynamic>))
          .toList(),
      externalId: json['external_id'] as String?,
    );

Map<String, dynamic> _$AdminCollectionToJson(AdminCollection instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'handle': instance.handle,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt.toIso8601String(),
      'products': instance.products,
      'metadata': instance.metadata,
      'translations': instance.translations,
      'external_id': instance.externalId,
    };
