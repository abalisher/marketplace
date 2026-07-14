// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_inventory_level.dart';

part 'admin_batch_inventory_items_location_levels_response.g.dart';

/// The result of managing inventory levels.
@JsonSerializable()
class AdminBatchInventoryItemsLocationLevelsResponse {
  const AdminBatchInventoryItemsLocationLevelsResponse({
    this.created,
    this.updated,
    this.deleted,
  });

  factory AdminBatchInventoryItemsLocationLevelsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchInventoryItemsLocationLevelsResponseFromJson(json);

  /// The created inventory levels.
  final List<AdminInventoryLevel>? created;

  /// The updated inventory levels.
  final List<AdminInventoryLevel>? updated;

  /// The IDs of deleted inventory levels.
  final List<String>? deleted;

  Map<String, Object?> toJson() =>
      _$AdminBatchInventoryItemsLocationLevelsResponseToJson(this);
}
