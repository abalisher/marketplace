// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_item_detail.dart';

part 'store_order_line_item_detail.g.dart';

@JsonSerializable()
class StoreOrderLineItemDetail {
  const StoreOrderLineItemDetail({
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

  factory StoreOrderLineItemDetail.fromJson(Map<String, Object?> json) =>
      _$StoreOrderLineItemDetailFromJson(json);

  /// the detail's ID.
  final String id;

  /// the ID of the associated line item.
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

  /// The item's quantity that's returned and added to the underlying variant's stocked quantity.
  @JsonKey(name: 'return_received_quantity')
  final num returnReceivedQuantity;

  /// The item's quantity that's returned but damaged. So, it's not added to the underlying variant's stocked quantity.
  @JsonKey(name: 'return_dismissed_quantity')
  final num returnDismissedQuantity;

  /// The item's quantity that's removed from the order.
  @JsonKey(name: 'written_off_quantity')
  final num writtenOffQuantity;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the detail was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the detail was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$StoreOrderLineItemDetailToJson(this);
}
