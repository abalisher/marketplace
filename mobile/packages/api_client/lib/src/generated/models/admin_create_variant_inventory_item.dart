// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_variant_inventory_item.g.dart';

/// The details of the variant-inventory item association.
@JsonSerializable()
class AdminCreateVariantInventoryItem {
  const AdminCreateVariantInventoryItem({
    required this.requiredQuantity,
    required this.inventoryItemId,
  });

  factory AdminCreateVariantInventoryItem.fromJson(Map<String, Object?> json) =>
      _$AdminCreateVariantInventoryItemFromJson(json);

  /// The quantity of the variant in the inventory item.
  @JsonKey(name: 'required_quantity')
  final num requiredQuantity;

  /// The inventory item's ID.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  Map<String, Object?> toJson() =>
      _$AdminCreateVariantInventoryItemToJson(this);
}
