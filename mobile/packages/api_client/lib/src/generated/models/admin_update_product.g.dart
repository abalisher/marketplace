// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProduct _$AdminUpdateProductFromJson(Map<String, dynamic> json) =>
    AdminUpdateProduct(
      title: json['title'] as String?,
      subtitle: json['subtitle'] as String?,
      description: json['description'] as String?,
      isGiftcard: json['is_giftcard'] as bool?,
      discountable: json['discountable'] as bool?,
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => Images3.fromJson(e as Map<String, dynamic>))
          .toList(),
      thumbnail: json['thumbnail'] as String?,
      handle: json['handle'] as String?,
      status: json['status'] == null
          ? null
          : AdminUpdateProductStatus.fromJson(json['status'] as String),
      typeId: json['type_id'] as String?,
      collectionId: json['collection_id'] as String?,
      categories: (json['categories'] as List<dynamic>?)
          ?.map((e) => Categories3.fromJson(e as Map<String, dynamic>))
          .toList(),
      tags: (json['tags'] as List<dynamic>?)
          ?.map((e) => Tags3.fromJson(e as Map<String, dynamic>))
          .toList(),
      options: (json['options'] as List<dynamic>?)
          ?.map(
            (e) => AdminUpdateProductOption.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      variants: (json['variants'] as List<dynamic>?)
          ?.map(
            (e) => AdminUpdateProductVariantsSealed.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
      salesChannels: (json['sales_channels'] as List<dynamic>?)
          ?.map((e) => SalesChannels3.fromJson(e as Map<String, dynamic>))
          .toList(),
      weight: json['weight'] as num?,
      length: json['length'] as num?,
      height: json['height'] as num?,
      width: json['width'] as num?,
      hsCode: json['hs_code'] as String?,
      midCode: json['mid_code'] as String?,
      originCountry: json['origin_country'] as String?,
      material: json['material'] as String?,
      metadata: json['metadata'],
      externalId: json['external_id'] as String?,
    );

Map<String, dynamic> _$AdminUpdateProductToJson(AdminUpdateProduct instance) =>
    <String, dynamic>{
      'title': ?instance.title,
      'subtitle': ?instance.subtitle,
      'description': ?instance.description,
      'is_giftcard': ?instance.isGiftcard,
      'discountable': ?instance.discountable,
      'images': ?instance.images,
      'thumbnail': ?instance.thumbnail,
      'handle': ?instance.handle,
      'status': ?_$AdminUpdateProductStatusEnumMap[instance.status],
      'type_id': ?instance.typeId,
      'collection_id': ?instance.collectionId,
      'categories': ?instance.categories,
      'tags': ?instance.tags,
      'options': ?instance.options,
      'variants': ?instance.variants,
      'sales_channels': ?instance.salesChannels,
      'weight': ?instance.weight,
      'length': ?instance.length,
      'height': ?instance.height,
      'width': ?instance.width,
      'hs_code': ?instance.hsCode,
      'mid_code': ?instance.midCode,
      'origin_country': ?instance.originCountry,
      'material': ?instance.material,
      'metadata': ?instance.metadata,
      'external_id': ?instance.externalId,
    };

const _$AdminUpdateProductStatusEnumMap = {
  AdminUpdateProductStatus.draft: 'draft',
  AdminUpdateProductStatus.proposed: 'proposed',
  AdminUpdateProductStatus.published: 'published',
  AdminUpdateProductStatus.rejected: 'rejected',
  AdminUpdateProductStatus.$unknown: r'$unknown',
};
