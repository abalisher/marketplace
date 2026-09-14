// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_collection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCollection _$StoreCollectionFromJson(Map<String, dynamic> json) =>
    StoreCollection(
      id: json['id'] as String,
      title: json['title'] as String,
      handle: json['handle'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      metadata: json['metadata'],
      products: json['products'] as List<dynamic>?,
      externalId: json['external_id'] as String?,
    );

Map<String, dynamic> _$StoreCollectionToJson(StoreCollection instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'handle': instance.handle,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'products': ?instance.products,
      'metadata': ?instance.metadata,
      'external_id': ?instance.externalId,
    };
