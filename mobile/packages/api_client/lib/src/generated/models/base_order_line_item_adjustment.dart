// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_order_line_item_adjustment.g.dart';

/// The adjustment's details.
@JsonSerializable()
class BaseOrderLineItemAdjustment {
  const BaseOrderLineItemAdjustment({
    required this.item,
    required this.itemId,
    required this.id,
    required this.amount,
    required this.orderId,
    required this.createdAt,
    required this.updatedAt,
    this.code,
    this.description,
    this.promotionId,
    this.providerId,
  });

  factory BaseOrderLineItemAdjustment.fromJson(Map<String, Object?> json) =>
      _$BaseOrderLineItemAdjustmentFromJson(json);

  final dynamic item;

  /// The ID of the item this adjustment applies to.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The adjustment's ID.
  final String id;

  /// The adjustment's code.
  final String? code;

  /// The adjustment's amount.
  final num amount;

  /// The ID of the associated order.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The adjustment's description.
  final String? description;

  /// The ID of the promotion that this applies on the order's item.
  @JsonKey(name: 'promotion_id')
  final String? promotionId;

  /// The adjustment's provider ID.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  /// The date the adjustment was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the adjustment was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$BaseOrderLineItemAdjustmentToJson(this);
}
