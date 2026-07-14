// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_claim_item.dart';
import 'order.dart';
import 'order_claim_type.dart';
import 'order_shipping_method.dart';
import 'order_transaction.dart';

part 'order_claim.g.dart';

/// The order change's claim.
@JsonSerializable()
class OrderClaim {
  const OrderClaim({
    required this.id,
    required this.orderId,
    required this.claimItems,
    required this.additionalItems,
    required this.displayId,
    required this.metadata,
    required this.type,
    required this.orderVersion,
    this.returnValue,
    this.returnId,
    this.noNotification,
    this.refundAmount,
    this.shippingMethods,
    this.transactions,
    this.createdAt,
    this.updatedAt,
    this.order,
    this.rawRefundAmount,
    this.createdBy,
    this.deletedAt,
    this.canceledAt,
  });

  factory OrderClaim.fromJson(Map<String, Object?> json) =>
      _$OrderClaimFromJson(json);

  /// The claim's ID.
  final String id;

  /// The ID of the order associated with the claim.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The order items targetted by the claim.
  @JsonKey(name: 'claim_items')
  final List<BaseClaimItem> claimItems;

  /// The outbound or new items of the claim.
  @JsonKey(name: 'additional_items')
  final List<BaseClaimItem> additionalItems;

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final dynamic returnValue;

  /// The ID of the associated return.
  @JsonKey(name: 'return_id')
  final String? returnId;

  /// Whether the customer should be notified about changes in the claim.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  /// The amount to be refunded.
  @JsonKey(name: 'refund_amount')
  final num? refundAmount;

  /// The claim's display ID.
  @JsonKey(name: 'display_id')
  final num displayId;

  /// The claim's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<OrderShippingMethod>? shippingMethods;

  /// The claim's transactions.
  final List<OrderTransaction>? transactions;

  /// The claim's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The claim's creation date.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The claim's update date.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The claim's type.
  final OrderClaimType type;
  final Order? order;

  /// The claim's order version.
  @JsonKey(name: 'order_version')
  final num orderVersion;
  @JsonKey(name: 'raw_refund_amount')
  final dynamic rawRefundAmount;

  /// The ID of the user that created the claim.
  @JsonKey(name: 'created_by')
  final String? createdBy;

  /// The date the claim was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The date the claim was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime? canceledAt;

  Map<String, Object?> toJson() => _$OrderClaimToJson(this);
}
