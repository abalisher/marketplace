// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_batch_create_inventory_item_location_levels.dart';

part 'admin_create_inventory_item.g.dart';

/// The inventory item's details.
@JsonSerializable()
class AdminCreateInventoryItem {
  const AdminCreateInventoryItem({
    this.sku,
    this.hsCode,
    this.weight,
    this.length,
    this.height,
    this.width,
    this.originCountry,
    this.midCode,
    this.material,
    this.title,
    this.description,
    this.requiresShipping,
    this.thumbnail,
    this.metadata,
    this.locationLevels,
    this.unitOfMeasure,
  });

  factory AdminCreateInventoryItem.fromJson(Map<String, Object?> json) =>
      _$AdminCreateInventoryItemFromJson(json);

  /// The inventory item's SKU.
  final String? sku;

  /// The inventory item's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// The inventory item's weight.
  final num? weight;

  /// The inventory item's length.
  final num? length;

  /// The inventory item's height.
  final num? height;

  /// The inventory item's width.
  final num? width;

  /// The inventory item's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The inventory item's mid code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// The inventory item's material.
  final String? material;

  /// The inventory item's title.
  final String? title;

  /// The description of the variant associated with the inventory item.
  final String? description;

  /// Whether the item requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool? requiresShipping;

  /// The inventory item's thumbnail.
  final String? thumbnail;

  /// The inventory item's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The inventory item's location levels.
  @JsonKey(name: 'location_levels')
  final List<AdminBatchCreateInventoryItemLocationLevels>? locationLevels;

  /// The inventory item's unit of measure.
  @JsonKey(name: 'unit_of_measure')
  final String? unitOfMeasure;

  Map<String, Object?> toJson() => _$AdminCreateInventoryItemToJson(this);
}
