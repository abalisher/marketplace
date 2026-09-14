// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_inventory_item.g.dart';

/// The properties to update in the inventory item.
@JsonSerializable()
class AdminUpdateInventoryItem {
  const AdminUpdateInventoryItem({
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
    this.unitOfMeasure,
  });

  factory AdminUpdateInventoryItem.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateInventoryItemFromJson(json);

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

  /// The inventory item's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// The inventory item's material.
  final String? material;

  /// The inventory item's title.
  final String? title;

  /// The inventory item's description.
  final String? description;

  /// Whether the inventory item requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool? requiresShipping;

  /// The URL of an image to be used as the inventory item's thumbnail. You can use the Upload API routes to upload an image and get its URL.
  final String? thumbnail;

  /// The inventory item's metadata. Can be custom data in key-value pairs.
  final dynamic metadata;

  /// The inventory item's unit of measure.
  @JsonKey(name: 'unit_of_measure')
  final String? unitOfMeasure;

  Map<String, Object?> toJson() => _$AdminUpdateInventoryItemToJson(this);
}
