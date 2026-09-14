// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateProduct _$AdminCreateProductFromJson(Map<String, dynamic> json) =>
    AdminCreateProduct(
      title: json['title'] as String,
      subtitle: json['subtitle'] as String?,
      description: json['description'] as String?,
      isGiftcard: json['is_giftcard'] as bool?,
      discountable: json['discountable'] as bool?,
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => Images2.fromJson(e as Map<String, dynamic>))
          .toList(),
      thumbnail: json['thumbnail'] as String?,
      handle: json['handle'] as String?,
      status: json['status'] == null
          ? null
          : AdminCreateProductStatus.fromJson(json['status'] as String),
      typeId: json['type_id'] as String?,
      collectionId: json['collection_id'] as String?,
      categories: (json['categories'] as List<dynamic>?)
          ?.map((e) => Categories2.fromJson(e as Map<String, dynamic>))
          .toList(),
      tags: (json['tags'] as List<dynamic>?)
          ?.map((e) => Tags2.fromJson(e as Map<String, dynamic>))
          .toList(),
      options: (json['options'] as List<dynamic>?)
          ?.map(
            (e) => AdminCreateProductOptionsSealed.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
      variants: (json['variants'] as List<dynamic>?)
          ?.map(
            (e) =>
                AdminCreateProductVariant.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      salesChannels: (json['sales_channels'] as List<dynamic>?)
          ?.map((e) => SalesChannels2.fromJson(e as Map<String, dynamic>))
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
      shippingProfileId: json['shipping_profile_id'] as String?,
    );

Map<String, dynamic> _$AdminCreateProductToJson(AdminCreateProduct instance) =>
    <String, dynamic>{
      'title': instance.title,
      'subtitle': ?instance.subtitle,
      'description': ?instance.description,
      'is_giftcard': ?instance.isGiftcard,
      'discountable': ?instance.discountable,
      'images': ?instance.images,
      'thumbnail': ?instance.thumbnail,
      'handle': ?instance.handle,
      'status': ?_$AdminCreateProductStatusEnumMap[instance.status],
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
      'shipping_profile_id': ?instance.shippingProfileId,
    };

const _$AdminCreateProductStatusEnumMap = {
  AdminCreateProductStatus.draft: 'draft',
  AdminCreateProductStatus.proposed: 'proposed',
  AdminCreateProductStatus.published: 'published',
  AdminCreateProductStatus.rejected: 'rejected',
  AdminCreateProductStatus.$unknown: r'$unknown',
};
