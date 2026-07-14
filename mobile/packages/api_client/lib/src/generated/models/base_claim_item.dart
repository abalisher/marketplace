// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_item.dart';
import 'base_claim_item_reason.dart';
import 'raw_quantity.dart';

part 'base_claim_item.g.dart';

/// The claim item's details.
@JsonSerializable()
class BaseClaimItem {
  const BaseClaimItem({
    required this.id,
    required this.claimId,
    required this.orderId,
    required this.itemId,
    required this.quantity,
    required this.reason,
    required this.rawQuantity,
    this.metadata,
    this.createdAt,
    this.updatedAt,
    this.item,
  });

  factory BaseClaimItem.fromJson(Map<String, Object?> json) =>
      _$BaseClaimItemFromJson(json);

  /// The claim item's ID.
  final String id;

  /// The ID of the claim this item belongs to.
  @JsonKey(name: 'claim_id')
  final String claimId;

  /// The ID of the order this item belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the item in the order.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The quantity claimed.
  final num quantity;

  /// The claim's reason.
  final BaseClaimItemReason reason;

  /// The quantity claimed.
  @JsonKey(name: 'raw_quantity')
  final RawQuantity rawQuantity;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the claim was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the claim was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  final AdminOrderLineItem? item;

  Map<String, Object?> toJson() => _$BaseClaimItemToJson(this);
}
