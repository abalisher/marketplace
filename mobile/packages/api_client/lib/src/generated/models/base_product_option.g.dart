// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_product_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseProductOption _$BaseProductOptionFromJson(Map<String, dynamic> json) =>
    BaseProductOption(
      id: json['id'] as String,
      title: json['title'] as String,
      isExclusive: json['is_exclusive'] as bool,
      values: (json['values'] as List<dynamic>?)
          ?.map(
            (e) => BaseProductOptionValue.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
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

Map<String, dynamic> _$BaseProductOptionToJson(BaseProductOption instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'values': ?instance.values,
      'metadata': ?instance.metadata,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'is_exclusive': instance.isExclusive,
      'products': ?instance.products,
    };
