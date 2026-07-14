// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_batch_create_inventory_items_location_levels.dart';
import 'admin_batch_update_inventory_items_location_levels.dart';

part 'admin_batch_inventory_items_location_levels.g.dart';

/// The inventory levels to manage.
@JsonSerializable()
class AdminBatchInventoryItemsLocationLevels {
  const AdminBatchInventoryItemsLocationLevels({
    this.create,
    this.update,
    this.delete,
    this.force,
  });

  factory AdminBatchInventoryItemsLocationLevels.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchInventoryItemsLocationLevelsFromJson(json);

  /// The inventory levels to create.
  final List<AdminBatchCreateInventoryItemsLocationLevels>? create;

  /// The inventory levels to update.
  final List<AdminBatchUpdateInventoryItemsLocationLevels>? update;

  /// The IDs of the inventory levels to delete.
  final List<String>? delete;

  /// Whether to delete specified inventory levels even if they have a non-zero stocked quantity.
  final bool? force;

  Map<String, Object?> toJson() =>
      _$AdminBatchInventoryItemsLocationLevelsToJson(this);
}
