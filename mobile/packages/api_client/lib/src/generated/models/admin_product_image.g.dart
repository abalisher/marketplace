// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_image.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductImage _$AdminProductImageFromJson(Map<String, dynamic> json) =>
    AdminProductImage(
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
      product: json['product'],
      variants: json['variants'] as List<dynamic>?,
    );

Map<String, dynamic> _$AdminProductImageToJson(AdminProductImage instance) =>
    <String, dynamic>{
      'id': instance.id,
      'url': instance.url,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'metadata': ?instance.metadata,
      'rank': instance.rank,
      'product': ?instance.product,
      'variants': ?instance.variants,
    };
