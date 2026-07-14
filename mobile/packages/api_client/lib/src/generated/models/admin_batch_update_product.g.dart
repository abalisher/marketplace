// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_update_product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchUpdateProduct _$AdminBatchUpdateProductFromJson(
  Map<String, dynamic> json,
) => AdminBatchUpdateProduct(
  id: json['id'] as String,
  title: json['title'] as String?,
  subtitle: json['subtitle'] as String?,
  description: json['description'] as String?,
  isGiftcard: json['is_giftcard'] as bool?,
  discountable: json['discountable'] as bool?,
  images: (json['images'] as List<dynamic>?)
      ?.map((e) => Images.fromJson(e as Map<String, dynamic>))
      .toList(),
  thumbnail: json['thumbnail'] as String?,
  handle: json['handle'] as String?,
  status: json['status'] == null
      ? null
      : AdminBatchUpdateProductStatus.fromJson(json['status'] as String),
  typeId: json['type_id'] as String?,
  collectionId: json['collection_id'] as String?,
  categories: (json['categories'] as List<dynamic>?)
      ?.map((e) => Categories.fromJson(e as Map<String, dynamic>))
      .toList(),
  tags: (json['tags'] as List<dynamic>?)
      ?.map((e) => Tags.fromJson(e as Map<String, dynamic>))
      .toList(),
  variants: (json['variants'] as List<dynamic>?)
      ?.map(
        (e) => AdminBatchUpdateProductVariantsSealed.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  salesChannels: (json['sales_channels'] as List<dynamic>?)
      ?.map((e) => SalesChannels.fromJson(e as Map<String, dynamic>))
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
  optionIds: (json['option_ids'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$AdminBatchUpdateProductToJson(
  AdminBatchUpdateProduct instance,
) => <String, dynamic>{
  'title': instance.title,
  'subtitle': instance.subtitle,
  'description': instance.description,
  'is_giftcard': instance.isGiftcard,
  'discountable': instance.discountable,
  'images': instance.images,
  'thumbnail': instance.thumbnail,
  'handle': instance.handle,
  'status': _$AdminBatchUpdateProductStatusEnumMap[instance.status],
  'type_id': instance.typeId,
  'collection_id': instance.collectionId,
  'categories': instance.categories,
  'tags': instance.tags,
  'variants': instance.variants,
  'sales_channels': instance.salesChannels,
  'weight': instance.weight,
  'length': instance.length,
  'height': instance.height,
  'width': instance.width,
  'hs_code': instance.hsCode,
  'mid_code': instance.midCode,
  'origin_country': instance.originCountry,
  'material': instance.material,
  'metadata': instance.metadata,
  'external_id': instance.externalId,
  'id': instance.id,
  'shipping_profile_id': instance.shippingProfileId,
  'option_ids': instance.optionIds,
};

const _$AdminBatchUpdateProductStatusEnumMap = {
  AdminBatchUpdateProductStatus.draft: 'draft',
  AdminBatchUpdateProductStatus.proposed: 'proposed',
  AdminBatchUpdateProductStatus.published: 'published',
  AdminBatchUpdateProductStatus.rejected: 'rejected',
  AdminBatchUpdateProductStatus.$unknown: r'$unknown',
};
