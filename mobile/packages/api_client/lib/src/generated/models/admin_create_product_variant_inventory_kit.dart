// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_product_variant_inventory_kit.g.dart';

/// The details of a variant's inventory item.
@JsonSerializable()
class AdminCreateProductVariantInventoryKit {
  const AdminCreateProductVariantInventoryKit({
    required this.inventoryItemId,
    required this.requiredQuantity,
  });

  factory AdminCreateProductVariantInventoryKit.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreateProductVariantInventoryKitFromJson(json);

  /// The inventory item's ID.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The number of units a single quantity is equivalent to. For example, if a customer orders one quantity of the variant, Medusa checks the availability of the quantity multiplied by the value set for `required_quantity`. When the customer orders the quantity, Medusa reserves the ordered quantity multiplied by the value set for `required_quantity`.
  @JsonKey(name: 'required_quantity')
  final num requiredQuantity;

  Map<String, Object?> toJson() =>
      _$AdminCreateProductVariantInventoryKitToJson(this);
}
