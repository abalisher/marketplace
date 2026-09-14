// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProduct _$AdminProductFromJson(Map<String, dynamic> json) => AdminProduct(
  subtitle: json['subtitle'] as String?,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  externalId: json['external_id'] as String?,
  variants: (json['variants'] as List<dynamic>)
      .map((e) => AdminProductVariant.fromJson(e as Map<String, dynamic>))
      .toList(),
  type: AdminProductType.fromJson(json['type'] as Map<String, dynamic>),
  id: json['id'] as String,
  length: json['length'] as num?,
  title: json['title'] as String,
  status: AdminProductStatus.fromJson(json['status'] as String),
  options: (json['options'] as List<dynamic>)
      .map((e) => AdminProductOption.fromJson(e as Map<String, dynamic>))
      .toList(),
  description: json['description'] as String?,
  discountable: json['discountable'] as bool,
  typeId: json['type_id'] as String?,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  handle: json['handle'] as String,
  height: json['height'] as num?,
  isGiftcard: json['is_giftcard'] as bool,
  thumbnail: json['thumbnail'] as String?,
  width: json['width'] as num?,
  weight: json['weight'] as num?,
  collectionId: json['collection_id'] as String?,
  originCountry: json['origin_country'] as String?,
  hsCode: json['hs_code'] as String?,
  midCode: json['mid_code'] as String?,
  material: json['material'] as String?,
  images: (json['images'] as List<dynamic>)
      .map((e) => AdminProductImage.fromJson(e as Map<String, dynamic>))
      .toList(),
  metadata: json['metadata'],
  tags: (json['tags'] as List<dynamic>?)
      ?.map((e) => AdminProductTag.fromJson(e as Map<String, dynamic>))
      .toList(),
  collection: json['collection'] == null
      ? null
      : AdminCollection.fromJson(json['collection'] as Map<String, dynamic>),
  salesChannels: (json['sales_channels'] as List<dynamic>?)
      ?.map((e) => AdminSalesChannel.fromJson(e as Map<String, dynamic>))
      .toList(),
  categories: (json['categories'] as List<dynamic>?)
      ?.map((e) => AdminProductCategory.fromJson(e as Map<String, dynamic>))
      .toList(),
  shippingProfile: json['shipping_profile'] == null
      ? null
      : AdminShippingProfile.fromJson(
          json['shipping_profile'] as Map<String, dynamic>,
        ),
  translations: (json['translations'] as List<dynamic>?)
      ?.map((e) => AdminTranslation.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminProductToJson(AdminProduct instance) =>
    <String, dynamic>{
      'collection': ?instance.collection,
      'categories': ?instance.categories,
      'sales_channels': ?instance.salesChannels,
      'variants': instance.variants,
      'type': instance.type,
      'tags': ?instance.tags,
      'length': ?instance.length,
      'title': instance.title,
      'status': _$AdminProductStatusEnumMap[instance.status]!,
      'options': instance.options,
      'description': ?instance.description,
      'id': instance.id,
      'metadata': ?instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
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
      'collection_id': ?instance.collectionId,
      'type_id': ?instance.typeId,
      'images': instance.images,
      'discountable': instance.discountable,
      'external_id': ?instance.externalId,
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'shipping_profile': ?instance.shippingProfile,
      'translations': ?instance.translations,
    };

const _$AdminProductStatusEnumMap = {
  AdminProductStatus.draft: 'draft',
  AdminProductStatus.proposed: 'proposed',
  AdminProductStatus.published: 'published',
  AdminProductStatus.rejected: 'rejected',
  AdminProductStatus.$unknown: r'$unknown',
};
