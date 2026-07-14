// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_create_inventory_item_location_levels.g.dart';

/// The inventory level's details.
@JsonSerializable()
class AdminBatchCreateInventoryItemLocationLevels {
  const AdminBatchCreateInventoryItemLocationLevels({
    required this.locationId,
    this.stockedQuantity,
    this.incomingQuantity,
  });

  factory AdminBatchCreateInventoryItemLocationLevels.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchCreateInventoryItemLocationLevelsFromJson(json);

  /// The ID of the associated location.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The inventory level's stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num? stockedQuantity;

  /// The inventory level's incoming quantity.
  @JsonKey(name: 'incoming_quantity')
  final num? incomingQuantity;

  Map<String, Object?> toJson() =>
      _$AdminBatchCreateInventoryItemLocationLevelsToJson(this);
}
