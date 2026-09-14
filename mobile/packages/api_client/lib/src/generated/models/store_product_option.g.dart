// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductOption _$StoreProductOptionFromJson(Map<String, dynamic> json) =>
    StoreProductOption(
      id: json['id'] as String,
      title: json['title'] as String,
      isExclusive: json['is_exclusive'] as bool,
      product: json['product'],
      values: (json['values'] as List<dynamic>?)
          ?.map(
            (e) => StoreProductOptionValue.fromJson(e as Map<String, dynamic>),
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
      products: (json['products'] as List<dynamic>?)
          ?.map((e) => BaseProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreProductOptionToJson(StoreProductOption instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'product': ?instance.product,
      'values': ?instance.values,
      'metadata': ?instance.metadata,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'products': ?instance.products,
      'is_exclusive': instance.isExclusive,
    };
