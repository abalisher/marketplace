// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_inventory_level.dart';

part 'admin_inventory_item.g.dart';

/// The inventory item's details.
@JsonSerializable()
class AdminInventoryItem {
  const AdminInventoryItem({
    required this.id,
    required this.requiresShipping,
    required this.stockedQuantity,
    required this.reservedQuantity,
    this.sku,
    this.originCountry,
    this.hsCode,
    this.midCode,
    this.material,
    this.weight,
    this.length,
    this.height,
    this.width,
    this.title,
    this.description,
    this.thumbnail,
    this.metadata,
    this.locationLevels,
  });

  factory AdminInventoryItem.fromJson(Map<String, Object?> json) =>
      _$AdminInventoryItemFromJson(json);

  /// The inventory item's ID.
  final String id;

  /// The inventory item's sku.
  final String? sku;

  /// The inventory item's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The inventory item's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// Whether the inventory item requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool requiresShipping;

  /// The inventory item's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// The inventory item's material.
  final String? material;

  /// The inventory item's weight.
  final num? weight;

  /// The inventory item's length.
  final num? length;

  /// The inventory item's height.
  final num? height;

  /// The inventory item's width.
  final num? width;

  /// The inventory item's title.
  final String? title;

  /// The inventory item's description.
  final String? description;

  /// The thumbnail URL of the inventory item.
  final String? thumbnail;

  /// Custom key-value pairs, used to store additional information about the inventory item.
  final dynamic metadata;

  /// The inventory item's location levels.
  @JsonKey(name: 'location_levels')
  final List<AdminInventoryLevel>? locationLevels;

  /// The inventory item's stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num stockedQuantity;

  /// The inventory item's reserved quantity.
  @JsonKey(name: 'reserved_quantity')
  final num reservedQuantity;

  Map<String, Object?> toJson() => _$AdminInventoryItemToJson(this);
}
