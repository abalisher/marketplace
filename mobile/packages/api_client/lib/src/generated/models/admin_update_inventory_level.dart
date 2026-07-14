// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_inventory_level.g.dart';

/// The properties to update in the inventory level.
@JsonSerializable()
class AdminUpdateInventoryLevel {
  const AdminUpdateInventoryLevel({
    this.stockedQuantity,
    this.incomingQuantity,
  });

  factory AdminUpdateInventoryLevel.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateInventoryLevelFromJson(json);

  /// The inventory level's stocked quantity.
  @JsonKey(name: 'stocked_quantity')
  final num? stockedQuantity;

  /// The inventory level's incoming quantity.
  @JsonKey(name: 'incoming_quantity')
  final num? incomingQuantity;

  Map<String, Object?> toJson() => _$AdminUpdateInventoryLevelToJson(this);
}
