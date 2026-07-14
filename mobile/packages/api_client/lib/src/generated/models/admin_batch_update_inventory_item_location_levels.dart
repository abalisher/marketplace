// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_update_inventory_item_location_levels.g.dart';

/// The inventory level's details.
@JsonSerializable()
class AdminBatchUpdateInventoryItemLocationLevels {
  const AdminBatchUpdateInventoryItemLocationLevels({
    required this.locationId,
    this.stockedQuantity,
    this.incomingQuantity,
    this.id,
  });

  factory AdminBatchUpdateInventoryItemLocationLevels.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchUpdateInventoryItemLocationLevelsFromJson(json);

  /// The inventory level's stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num? stockedQuantity;

  /// The inventory level's incoming quantity.
  @JsonKey(name: 'incoming_quantity')
  final num? incomingQuantity;

  /// The associated stock location's ID.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The ID of the location level.
  final String? id;

  Map<String, Object?> toJson() =>
      _$AdminBatchUpdateInventoryItemLocationLevelsToJson(this);
}
