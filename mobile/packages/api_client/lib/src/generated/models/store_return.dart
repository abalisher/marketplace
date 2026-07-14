// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_return_item.dart';
import 'store_return_status.dart';

part 'store_return.g.dart';

/// The return's details.
@JsonSerializable()
class StoreReturn {
  const StoreReturn({
    required this.items,
    required this.id,
    required this.displayId,
    required this.createdAt,
    required this.orderId,
    required this.canceledAt,
    required this.receivedAt,
    required this.createdBy,
    required this.requestedAt,
    this.status,
    this.locationId,
    this.exchangeId,
    this.claimId,
    this.refundAmount,
  });

  factory StoreReturn.fromJson(Map<String, Object?> json) =>
      _$StoreReturnFromJson(json);

  /// The return's items.
  final List<StoreReturnItem> items;

  /// The return's status.
  final StoreReturnStatus? status;

  /// The return's ID.
  final String id;

  /// The return's display ID.
  @JsonKey(name: 'display_id')
  final num displayId;

  /// The date the return was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The ID of the order this return belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the location the return items are being returned to.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// The date the return was canceled.
  @JsonKey(name: 'canceled_at')
  final String canceledAt;

  /// The ID of the associated exchange.
  @JsonKey(name: 'exchange_id')
  final String? exchangeId;

  /// The ID of the associated claim.
  @JsonKey(name: 'claim_id')
  final String? claimId;

  /// The amount to be refunded.
  @JsonKey(name: 'refund_amount')
  final num? refundAmount;

  /// The date the return items were received.
  @JsonKey(name: 'received_at')
  final String receivedAt;

  /// The ID of the user that created the return.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The date the return was requested.
  @JsonKey(name: 'requested_at')
  final String requestedAt;

  Map<String, Object?> toJson() => _$StoreReturnToJson(this);
}
