// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_update_variant_inventory_item.g.dart';

/// Update a product variant's association with an inventory item.
@JsonSerializable()
class AdminBatchUpdateVariantInventoryItem {
  const AdminBatchUpdateVariantInventoryItem({
    required this.requiredQuantity,
    required this.inventoryItemId,
    required this.variantId,
  });

  factory AdminBatchUpdateVariantInventoryItem.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchUpdateVariantInventoryItemFromJson(json);

  /// The number of units a single quantity is equivalent to. For example, if a customer orders one quantity of the variant, Medusa checks the availability of the quantity multiplied by the value set for `required_quantity`. When the customer orders the quantity, Medusa reserves the ordered quantity multiplied by the value set for `required_quantity`.
  @JsonKey(name: 'required_quantity')
  final num requiredQuantity;

  /// The ID of the inventory item the variant is associated with.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The ID of the variant.
  @JsonKey(name: 'variant_id')
  final String variantId;

  Map<String, Object?> toJson() =>
      _$AdminBatchUpdateVariantInventoryItemToJson(this);
}
