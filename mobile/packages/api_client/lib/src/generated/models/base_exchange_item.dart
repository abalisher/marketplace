// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_item.dart';

part 'base_exchange_item.g.dart';

/// The item's details.
@JsonSerializable()
class BaseExchangeItem {
  const BaseExchangeItem({
    required this.id,
    required this.exchangeId,
    required this.orderId,
    required this.itemId,
    required this.quantity,
    required this.createdAt,
    required this.updatedAt,
    this.metadata,
    this.item,
  });

  factory BaseExchangeItem.fromJson(Map<String, Object?> json) =>
      _$BaseExchangeItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The ID of the exchange this item belongs to.
  @JsonKey(name: 'exchange_id')
  final String exchangeId;

  /// The ID of the order this item belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the item in the order.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The item's quantity.
  final num quantity;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  final AdminOrderLineItem? item;

  Map<String, Object?> toJson() => _$BaseExchangeItemToJson(this);
}
