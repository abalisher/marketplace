// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_delete_variant_inventory_item.g.dart';

/// Delete a product variant's association with an inventory item.
@JsonSerializable()
class AdminBatchDeleteVariantInventoryItem {
  const AdminBatchDeleteVariantInventoryItem({
    required this.inventoryItemId,
    required this.variantId,
  });

  factory AdminBatchDeleteVariantInventoryItem.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchDeleteVariantInventoryItemFromJson(json);

  /// The ID of the inventory item associated with the variant.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The ID of the variant.
  @JsonKey(name: 'variant_id')
  final String variantId;

  Map<String, Object?> toJson() =>
      _$AdminBatchDeleteVariantInventoryItemToJson(this);
}
