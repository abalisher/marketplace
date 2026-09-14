// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_inventory_level.g.dart';

/// The location level's location levels.
@JsonSerializable()
class AdminInventoryLevel {
  const AdminInventoryLevel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.inventoryItemId,
    required this.locationId,
    required this.stockedQuantity,
    required this.reservedQuantity,
    required this.incomingQuantity,
    required this.metadata,
    required this.availableQuantity,
    this.inventoryItem,
  });

  factory AdminInventoryLevel.fromJson(Map<String, Object?> json) =>
      _$AdminInventoryLevelFromJson(json);

  /// The location level's ID.
  final String id;

  /// The location level's created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The location level's updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The location level's deleted at.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The location level's inventory item id.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The location level's location id.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The location level's stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num stockedQuantity;

  /// The location level's reserved quantity.
  @JsonKey(name: 'reserved_quantity')
  final num reservedQuantity;

  /// The location level's incoming quantity.
  @JsonKey(name: 'incoming_quantity')
  final num incomingQuantity;

  /// The location level's metadata.
  final dynamic metadata;
  @JsonKey(name: 'inventory_item')
  final dynamic inventoryItem;

  /// The location level's available quantity.
  @JsonKey(name: 'available_quantity')
  final num availableQuantity;

  Map<String, Object?> toJson() => _$AdminInventoryLevelToJson(this);
}
