// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_claim.dart';
import 'admin_exchange.dart';
import 'admin_order.dart';
import 'admin_order_change_action.dart';
import 'admin_order_change_change_type.dart';
import 'admin_order_change_status.dart';
import 'admin_return.dart';

part 'admin_order_change.g.dart';

/// The order change's details.
@JsonSerializable()
class AdminOrderChange {
  const AdminOrderChange({
    required this.id,
    required this.version,
    required this.orderId,
    required this.returnId,
    required this.exchangeId,
    required this.claimId,
    required this.order,
    required this.returnOrder,
    required this.exchange,
    required this.claim,
    required this.actions,
    required this.status,
    required this.requestedBy,
    required this.requestedAt,
    required this.confirmedBy,
    required this.confirmedAt,
    required this.declinedBy,
    required this.declinedReason,
    required this.metadata,
    required this.declinedAt,
    required this.canceledBy,
    required this.canceledAt,
    required this.createdAt,
    required this.updatedAt,
    required this.createdBy,
    required this.internalNote,
    this.changeType,
    this.carryOverPromotions,
    this.noNotification,
  });

  factory AdminOrderChange.fromJson(Map<String, Object?> json) =>
      _$AdminOrderChangeFromJson(json);

  /// The order change's ID.
  final String id;

  /// The order change's version. This will be the order's version when the change is applied.
  final num version;

  /// The order change's type.
  @JsonKey(name: 'change_type')
  final AdminOrderChangeChangeType? changeType;

  /// The ID of the order this change applies on.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the associated return.
  @JsonKey(name: 'return_id')
  final String returnId;

  /// The ID of the associated exchange.
  @JsonKey(name: 'exchange_id')
  final String exchangeId;

  /// The ID of the associated claim.
  @JsonKey(name: 'claim_id')
  final String claimId;
  final AdminOrder order;
  @JsonKey(name: 'return_order')
  final AdminReturn returnOrder;
  final AdminExchange exchange;
  final AdminClaim claim;

  /// The order change's actions.
  final List<AdminOrderChangeAction> actions;

  /// The order change's status.
  final AdminOrderChangeStatus status;

  /// The ID of the user that requested the change.
  @JsonKey(name: 'requested_by')
  final String requestedBy;

  /// The date the order change was requested.
  @JsonKey(name: 'requested_at')
  final DateTime requestedAt;

  /// The ID of the user that confirmed the order change.
  @JsonKey(name: 'confirmed_by')
  final String confirmedBy;

  /// The date the order change was confirmed.
  @JsonKey(name: 'confirmed_at')
  final DateTime confirmedAt;

  /// The ID of the user that declined the order change.
  @JsonKey(name: 'declined_by')
  final String declinedBy;

  /// The reason the order change was declined.
  @JsonKey(name: 'declined_reason')
  final String declinedReason;

  /// The order change's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the order change was declined.
  @JsonKey(name: 'declined_at')
  final DateTime declinedAt;

  /// The ID of the user that canceled the order change.
  @JsonKey(name: 'canceled_by')
  final String canceledBy;

  /// The date the order change was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime canceledAt;

  /// The date the order change was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the order change was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// Whether promotions from the original order should be carried over to the order change (specifically, exchanges).
  @JsonKey(name: 'carry_over_promotions')
  final bool? carryOverPromotions;

  /// The ID of the user that created the order change.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The order change's internal note.
  @JsonKey(name: 'internal_note')
  final String internalNote;

  /// Whether to send notifications to the customer regarding the order change's updates.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  Map<String, Object?> toJson() => _$AdminOrderChangeToJson(this);
}
