// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_batch_create_variant_inventory_item.dart';
import 'admin_batch_delete_variant_inventory_item.dart';
import 'admin_batch_update_variant_inventory_item.dart';

part 'admin_batch_variant_inventory_items.g.dart';

/// The product variant inventories to manage.
@JsonSerializable()
class AdminBatchVariantInventoryItems {
  const AdminBatchVariantInventoryItems({
    this.create,
    this.update,
    this.delete,
  });

  factory AdminBatchVariantInventoryItems.fromJson(Map<String, Object?> json) =>
      _$AdminBatchVariantInventoryItemsFromJson(json);

  /// The associations to create between product variants and inventory items.
  final List<AdminBatchCreateVariantInventoryItem>? create;

  /// The product variants to update their association with inventory items.
  final List<AdminBatchUpdateVariantInventoryItem>? update;

  /// The product variants to delete their association with inventory items.
  final List<AdminBatchDeleteVariantInventoryItem>? delete;

  Map<String, Object?> toJson() =>
      _$AdminBatchVariantInventoryItemsToJson(this);
}
