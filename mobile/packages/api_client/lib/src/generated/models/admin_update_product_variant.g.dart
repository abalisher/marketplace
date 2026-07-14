// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_variant.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductVariant _$AdminUpdateProductVariantFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductVariant(
  title: json['title'] as String?,
  sku: json['sku'] as String?,
  ean: json['ean'] as String?,
  upc: json['upc'] as String?,
  barcode: json['barcode'] as String?,
  hsCode: json['hs_code'] as String?,
  midCode: json['mid_code'] as String?,
  allowBackorder: json['allow_backorder'] as bool?,
  manageInventory: json['manage_inventory'] as bool?,
  variantRank: json['variant_rank'] as num?,
  weight: json['weight'] as num?,
  length: json['length'] as num?,
  height: json['height'] as num?,
  width: json['width'] as num?,
  originCountry: json['origin_country'] as String?,
  material: json['material'] as String?,
  metadata: json['metadata'],
  prices: (json['prices'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminCreateProductVariantPrice.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  options: json['options'],
);

Map<String, dynamic> _$AdminUpdateProductVariantToJson(
  AdminUpdateProductVariant instance,
) => <String, dynamic>{
  'title': instance.title,
  'sku': instance.sku,
  'ean': instance.ean,
  'upc': instance.upc,
  'barcode': instance.barcode,
  'hs_code': instance.hsCode,
  'mid_code': instance.midCode,
  'allow_backorder': instance.allowBackorder,
  'manage_inventory': instance.manageInventory,
  'variant_rank': instance.variantRank,
  'weight': instance.weight,
  'length': instance.length,
  'height': instance.height,
  'width': instance.width,
  'origin_country': instance.originCountry,
  'material': instance.material,
  'metadata': instance.metadata,
  'prices': instance.prices,
  'options': instance.options,
};
