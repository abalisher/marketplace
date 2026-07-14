// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_return_item.dart';
import 'admin_return_status.dart';

part 'admin_return.g.dart';

/// The return's details.
@JsonSerializable()
class AdminReturn {
  const AdminReturn({
    required this.id,
    required this.orderId,
    required this.items,
    required this.createdAt,
    required this.canceledAt,
    required this.orderVersion,
    required this.displayId,
    required this.receivedAt,
    required this.createdBy,
    required this.requestedAt,
    this.status,
    this.refundAmount,
    this.exchangeId,
    this.locationId,
    this.claimId,
    this.noNotification,
  });

  factory AdminReturn.fromJson(Map<String, Object?> json) =>
      _$AdminReturnFromJson(json);

  /// The return's ID.
  final String id;

  /// The return's status.
  final AdminReturnStatus? status;

  /// The amount refunded by this return.
  @JsonKey(name: 'refund_amount')
  final num? refundAmount;

  /// The ID of the associated order.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The return's items.
  final List<AdminReturnItem> items;

  /// The date the return was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the return was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime canceledAt;

  /// The return's exchange id.
  @JsonKey(name: 'exchange_id')
  final String? exchangeId;

  /// The return's location id.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// The return's claim id.
  @JsonKey(name: 'claim_id')
  final String? claimId;

  /// The return's order version.
  @JsonKey(name: 'order_version')
  final num orderVersion;

  /// The return's display id.
  @JsonKey(name: 'display_id')
  final num displayId;

  /// Whether the customer should receive notifications about the return's updates.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  /// The date the return was received.
  @JsonKey(name: 'received_at')
  final String receivedAt;

  /// The ID of the user that created the return.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The date the return was requested.
  @JsonKey(name: 'requested_at')
  final String requestedAt;

  Map<String, Object?> toJson() => _$AdminReturnToJson(this);
}
