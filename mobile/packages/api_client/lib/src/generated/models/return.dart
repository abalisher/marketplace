// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'order.dart';
import 'order_claim.dart';
import 'order_return_item.dart';
import 'order_shipping_method.dart';
import 'order_transaction.dart';
import 'return_status.dart';

part 'return.g.dart';

/// The return's details.
@JsonSerializable()
class Return {
  const Return({
    required this.id,
    required this.status,
    required this.orderId,
    required this.items,
    required this.metadata,
    required this.displayId,
    this.refundAmount,
    this.shippingMethods,
    this.transactions,
    this.createdAt,
    this.updatedAt,
    this.canceledAt,
    this.rawRefundAmount,
    this.order,
    this.exchangeId,
    this.exchange,
    this.claimId,
    this.claim,
    this.locationId,
    this.noNotification,
    this.createdBy,
    this.deletedAt,
    this.requestedAt,
    this.receivedAt,
  });

  factory Return.fromJson(Map<String, Object?> json) => _$ReturnFromJson(json);

  /// The return's ID.
  final String id;

  /// The return's status.
  final ReturnStatus status;

  /// The amount refunded by this return.
  @JsonKey(name: 'refund_amount')
  final num? refundAmount;

  /// The ID of the associated order.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The return's items.
  final List<OrderReturnItem> items;

  /// The return's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<OrderShippingMethod>? shippingMethods;

  /// The return's transactions.
  final List<OrderTransaction>? transactions;

  /// The return's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the return was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the return was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the return was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime? canceledAt;
  @JsonKey(name: 'raw_refund_amount')
  final dynamic rawRefundAmount;
  final Order? order;

  /// The ID of the exchange this return belongs to, if any.
  @JsonKey(name: 'exchange_id')
  final String? exchangeId;
  final dynamic exchange;

  /// The ID of the claim this return belongs to, if any.
  @JsonKey(name: 'claim_id')
  final String? claimId;
  final OrderClaim? claim;

  /// The return order's display ID.
  @JsonKey(name: 'display_id')
  final num displayId;

  /// The ID of the stock location the items are returned to.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// Whether to notify the customer about changes in the return.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  /// The ID of the user that created the return.
  @JsonKey(name: 'created_by')
  final String? createdBy;

  /// The date the return was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The date the return was requested.
  @JsonKey(name: 'requested_at')
  final DateTime? requestedAt;

  /// The date the return was received.
  @JsonKey(name: 'received_at')
  final DateTime? receivedAt;

  Map<String, Object?> toJson() => _$ReturnToJson(this);
}
