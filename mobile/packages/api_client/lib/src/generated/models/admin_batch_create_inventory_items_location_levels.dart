// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_create_inventory_items_location_levels.g.dart';

/// The details of an inventory level to create.
@JsonSerializable()
class AdminBatchCreateInventoryItemsLocationLevels {
  const AdminBatchCreateInventoryItemsLocationLevels({
    required this.locationId,
    required this.inventoryItemId,
    this.stockedQuantity,
    this.incomingQuantity,
  });

  factory AdminBatchCreateInventoryItemsLocationLevels.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchCreateInventoryItemsLocationLevelsFromJson(json);

  /// The ID of the associated stock location.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The ID of the associated inventory item.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num? stockedQuantity;

  /// The incoming quantity to be added to stock.
  @JsonKey(name: 'incoming_quantity')
  final num? incomingQuantity;

  Map<String, Object?> toJson() =>
      _$AdminBatchCreateInventoryItemsLocationLevelsToJson(this);
}
