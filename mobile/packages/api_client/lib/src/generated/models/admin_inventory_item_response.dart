// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_inventory_item.dart';

part 'admin_inventory_item_response.g.dart';

/// The inventory item's details.
@JsonSerializable()
class AdminInventoryItemResponse {
  const AdminInventoryItemResponse({required this.inventoryItem});

  factory AdminInventoryItemResponse.fromJson(Map<String, Object?> json) =>
      _$AdminInventoryItemResponseFromJson(json);

  @JsonKey(name: 'inventory_item')
  final AdminInventoryItem inventoryItem;

  Map<String, Object?> toJson() => _$AdminInventoryItemResponseToJson(this);
}
