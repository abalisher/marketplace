// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProduct _$StoreProductFromJson(Map<String, dynamic> json) => StoreProduct(
  length: json['length'] as num?,
  title: json['title'] as String,
  status: json['status'] == null
      ? null
      : StoreProductStatus.fromJson(json['status'] as String),
  options: (json['options'] as List<dynamic>)
      .map((e) => StoreProductOption.fromJson(e as Map<String, dynamic>))
      .toList(),
  description: json['description'] as String?,
  id: json['id'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  variants: (json['variants'] as List<dynamic>)
      .map((e) => StoreProductVariant.fromJson(e as Map<String, dynamic>))
      .toList(),
  handle: json['handle'] as String,
  subtitle: json['subtitle'] as String?,
  isGiftcard: json['is_giftcard'] as bool,
  thumbnail: json['thumbnail'] as String?,
  width: json['width'] as num?,
  weight: json['weight'] as num?,
  height: json['height'] as num?,
  originCountry: json['origin_country'] as String?,
  hsCode: json['hs_code'] as String?,
  midCode: json['mid_code'] as String?,
  material: json['material'] as String?,
  collectionId: json['collection_id'] as String?,
  typeId: json['type_id'] as String?,
  images: (json['images'] as List<dynamic>)
      .map((e) => StoreProductImage.fromJson(e as Map<String, dynamic>))
      .toList(),
  discountable: json['discountable'] as bool,
  externalId: json['external_id'] as String?,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  categories: json['categories'] as List<dynamic>?,
  type: json['type'] == null
      ? null
      : StoreProductType.fromJson(json['type'] as Map<String, dynamic>),
  metadata: json['metadata'],
  collection: json['collection'] == null
      ? null
      : StoreCollection.fromJson(json['collection'] as Map<String, dynamic>),
  tags: (json['tags'] as List<dynamic>?)
      ?.map((e) => StoreProductTag.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreProductToJson(StoreProduct instance) =>
    <String, dynamic>{
      'categories': ?instance.categories,
      'type': ?instance.type,
      'length': ?instance.length,
      'title': instance.title,
      'status': ?_$StoreProductStatusEnumMap[instance.status],
      'options': instance.options,
      'description': ?instance.description,
      'id': instance.id,
      'metadata': ?instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'variants': instance.variants,
      'handle': instance.handle,
      'subtitle': ?instance.subtitle,
      'is_giftcard': instance.isGiftcard,
      'thumbnail': ?instance.thumbnail,
      'width': ?instance.width,
      'weight': ?instance.weight,
      'height': ?instance.height,
      'origin_country': ?instance.originCountry,
      'hs_code': ?instance.hsCode,
      'mid_code': ?instance.midCode,
      'material': ?instance.material,
      'collection': ?instance.collection,
      'collection_id': ?instance.collectionId,
      'type_id': ?instance.typeId,
      'tags': ?instance.tags,
      'images': instance.images,
      'discountable': instance.discountable,
      'external_id': ?instance.externalId,
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };

const _$StoreProductStatusEnumMap = {
  StoreProductStatus.draft: 'draft',
  StoreProductStatus.proposed: 'proposed',
  StoreProductStatus.published: 'published',
  StoreProductStatus.rejected: 'rejected',
  StoreProductStatus.$unknown: r'$unknown',
};
