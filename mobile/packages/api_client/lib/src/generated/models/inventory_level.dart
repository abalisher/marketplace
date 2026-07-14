// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'inventory_level.g.dart';

/// The inventory level's details
@JsonSerializable()
class InventoryLevel {
  const InventoryLevel({
    required this.id,
    required this.inventoryItemId,
    required this.locationId,
    required this.stockedQuantity,
    required this.reservedQuantity,
    required this.availableQuantity,
    required this.incomingQuantity,
    this.metadata,
  });

  factory InventoryLevel.fromJson(Map<String, Object?> json) =>
      _$InventoryLevelFromJson(json);

  /// The inventory level's ID.
  final String id;

  /// The ID of the associated inventory item.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The ID of the associated location.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The inventory level's stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num stockedQuantity;

  /// The inventory level's reserved quantity.
  @JsonKey(name: 'reserved_quantity')
  final num reservedQuantity;

  /// The inventory level's available quantity.
  @JsonKey(name: 'available_quantity')
  final num availableQuantity;

  /// The inventory level's incoming quantity.
  @JsonKey(name: 'incoming_quantity')
  final num incomingQuantity;

  /// The inventory level's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$InventoryLevelToJson(this);
}
