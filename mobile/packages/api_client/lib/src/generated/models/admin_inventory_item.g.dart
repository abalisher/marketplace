// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInventoryItem _$AdminInventoryItemFromJson(Map<String, dynamic> json) =>
    AdminInventoryItem(
      id: json['id'] as String,
      requiresShipping: json['requires_shipping'] as bool,
      stockedQuantity: json['stocked_quantity'] as num,
      reservedQuantity: json['reserved_quantity'] as num,
      sku: json['sku'] as String?,
      originCountry: json['origin_country'] as String?,
      hsCode: json['hs_code'] as String?,
      midCode: json['mid_code'] as String?,
      material: json['material'] as String?,
      weight: json['weight'] as num?,
      length: json['length'] as num?,
      height: json['height'] as num?,
      width: json['width'] as num?,
      title: json['title'] as String?,
      description: json['description'] as String?,
      thumbnail: json['thumbnail'] as String?,
      metadata: json['metadata'],
      locationLevels: (json['location_levels'] as List<dynamic>?)
          ?.map((e) => AdminInventoryLevel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminInventoryItemToJson(AdminInventoryItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'sku': instance.sku,
      'origin_country': instance.originCountry,
      'hs_code': instance.hsCode,
      'requires_shipping': instance.requiresShipping,
      'mid_code': instance.midCode,
      'material': instance.material,
      'weight': instance.weight,
      'length': instance.length,
      'height': instance.height,
      'width': instance.width,
      'title': instance.title,
      'description': instance.description,
      'thumbnail': instance.thumbnail,
      'metadata': instance.metadata,
      'location_levels': instance.locationLevels,
      'stocked_quantity': instance.stockedQuantity,
      'reserved_quantity': instance.reservedQuantity,
    };
