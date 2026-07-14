// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_item.dart';
import 'history.dart';

part 'admin_order_item.g.dart';

/// The order item's details.
@JsonSerializable()
class AdminOrderItem {
  const AdminOrderItem({
    required this.orderId,
    required this.itemId,
    required this.version,
    required this.history,
    required this.item,
  });

  factory AdminOrderItem.fromJson(Map<String, Object?> json) =>
      _$AdminOrderItemFromJson(json);

  /// The ID of the order this item belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the associated line item.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The order item's version.
  final num version;

  /// The order item's history.
  final History history;
  final AdminOrderLineItem item;

  Map<String, Object?> toJson() => _$AdminOrderItemToJson(this);
}
