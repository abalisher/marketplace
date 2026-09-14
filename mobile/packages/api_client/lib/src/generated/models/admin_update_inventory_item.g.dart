// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateInventoryItem _$AdminUpdateInventoryItemFromJson(
  Map<String, dynamic> json,
) => AdminUpdateInventoryItem(
  sku: json['sku'] as String?,
  hsCode: json['hs_code'] as String?,
  weight: json['weight'] as num?,
  length: json['length'] as num?,
  height: json['height'] as num?,
  width: json['width'] as num?,
  originCountry: json['origin_country'] as String?,
  midCode: json['mid_code'] as String?,
  material: json['material'] as String?,
  title: json['title'] as String?,
  description: json['description'] as String?,
  requiresShipping: json['requires_shipping'] as bool?,
  thumbnail: json['thumbnail'] as String?,
  metadata: json['metadata'],
  unitOfMeasure: json['unit_of_measure'] as String?,
);

Map<String, dynamic> _$AdminUpdateInventoryItemToJson(
  AdminUpdateInventoryItem instance,
) => <String, dynamic>{
  'sku': ?instance.sku,
  'hs_code': ?instance.hsCode,
  'weight': ?instance.weight,
  'length': ?instance.length,
  'height': ?instance.height,
  'width': ?instance.width,
  'origin_country': ?instance.originCountry,
  'mid_code': ?instance.midCode,
  'material': ?instance.material,
  'title': ?instance.title,
  'description': ?instance.description,
  'requires_shipping': ?instance.requiresShipping,
  'thumbnail': ?instance.thumbnail,
  'metadata': ?instance.metadata,
  'unit_of_measure': ?instance.unitOfMeasure,
};
