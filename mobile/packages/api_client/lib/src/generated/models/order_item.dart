// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'order_item.g.dart';

/// The order item's detail.
@JsonSerializable()
class OrderItem {
  const OrderItem({
    required this.id,
    required this.itemId,
    required this.item,
    required this.quantity,
    required this.fulfilledQuantity,
    required this.deliveredQuantity,
    required this.shippedQuantity,
    required this.returnRequestedQuantity,
    required this.returnReceivedQuantity,
    required this.returnDismissedQuantity,
    required this.writtenOffQuantity,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderItem.fromJson(Map<String, Object?> json) =>
      _$OrderItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The ID of the associated line item.
  @JsonKey(name: 'item_id')
  final String itemId;
  final dynamic item;

  /// The item's quantity.
  final num quantity;

  /// The item's fulfilled quantity.
  @JsonKey(name: 'fulfilled_quantity')
  final num fulfilledQuantity;

  /// The item's delivered quantity.
  @JsonKey(name: 'delivered_quantity')
  final num deliveredQuantity;

  /// The item's shipped quantity.
  @JsonKey(name: 'shipped_quantity')
  final num shippedQuantity;

  /// The item's quantity that's requested to be returned.
  @JsonKey(name: 'return_requested_quantity')
  final num returnRequestedQuantity;

  /// The item's quantity that's received through a return.
  @JsonKey(name: 'return_received_quantity')
  final num returnReceivedQuantity;

  /// The item's quantity that's returned but dismissed because it's damaged.
  @JsonKey(name: 'return_dismissed_quantity')
  final num returnDismissedQuantity;

  /// The item's quantity that's removed due to an order change.
  @JsonKey(name: 'written_off_quantity')
  final num writtenOffQuantity;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$OrderItemToJson(this);
}
