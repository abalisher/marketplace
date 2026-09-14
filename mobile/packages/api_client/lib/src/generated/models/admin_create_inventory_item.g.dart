// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateInventoryItem _$AdminCreateInventoryItemFromJson(
  Map<String, dynamic> json,
) => AdminCreateInventoryItem(
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
  locationLevels: (json['location_levels'] as List<dynamic>?)
      ?.map(
        (e) => AdminBatchCreateInventoryItemLocationLevels.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  unitOfMeasure: json['unit_of_measure'] as String?,
);

Map<String, dynamic> _$AdminCreateInventoryItemToJson(
  AdminCreateInventoryItem instance,
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
  'location_levels': ?instance.locationLevels,
  'unit_of_measure': ?instance.unitOfMeasure,
};
