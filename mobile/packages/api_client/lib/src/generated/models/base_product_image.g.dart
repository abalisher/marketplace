// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_product_image.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseProductImage _$BaseProductImageFromJson(Map<String, dynamic> json) =>
    BaseProductImage(
      id: json['id'] as String,
      url: json['url'] as String,
      rank: json['rank'] as num,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      metadata: json['metadata'],
    );

Map<String, dynamic> _$BaseProductImageToJson(BaseProductImage instance) =>
    <String, dynamic>{
      'id': instance.id,
      'url': instance.url,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'metadata': ?instance.metadata,
      'rank': instance.rank,
    };
