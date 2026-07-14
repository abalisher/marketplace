// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_variant_inventory_item.g.dart';

/// The properties to update of the variant's inventory item association.
@JsonSerializable()
class AdminUpdateVariantInventoryItem {
  const AdminUpdateVariantInventoryItem({required this.requiredQuantity});

  factory AdminUpdateVariantInventoryItem.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateVariantInventoryItemFromJson(json);

  /// The number of units a single quantity is equivalent to. For example, if a customer orders one quantity of the variant, Medusa checks the availability of the quantity multiplied by the value set for `required_quantity`. When the customer orders the quantity, Medusa reserves the ordered quantity multiplied by the value set for `required_quantity`.
  @JsonKey(name: 'required_quantity')
  final num requiredQuantity;

  Map<String, Object?> toJson() =>
      _$AdminUpdateVariantInventoryItemToJson(this);
}
