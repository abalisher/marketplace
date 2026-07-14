// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductOption _$AdminProductOptionFromJson(Map<String, dynamic> json) =>
    AdminProductOption(
      id: json['id'] as String,
      title: json['title'] as String,
      isExclusive: json['is_exclusive'] as bool,
      values: json['values'] as List<dynamic>?,
      metadata: json['metadata'],
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      products: json['products'] as List<dynamic>?,
    );

Map<String, dynamic> _$AdminProductOptionToJson(AdminProductOption instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'values': instance.values,
      'metadata': instance.metadata,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'deleted_at': instance.deletedAt?.toIso8601String(),
      'products': instance.products,
      'is_exclusive': instance.isExclusive,
    };
