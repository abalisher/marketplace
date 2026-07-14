// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'inventory.g.dart';

@JsonSerializable()
class Inventory {
  const Inventory({required this.inventoryItemId});

  factory Inventory.fromJson(Map<String, Object?> json) =>
      _$InventoryFromJson(json);

  /// The ID of the inventory item.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  Map<String, Object?> toJson() => _$InventoryToJson(this);
}
