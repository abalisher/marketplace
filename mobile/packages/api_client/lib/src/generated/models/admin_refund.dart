// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_payment.dart';
import 'base_refund_reason.dart';

part 'admin_refund.g.dart';

/// The refund's details.
@JsonSerializable()
class AdminRefund {
  const AdminRefund({
    required this.id,
    required this.amount,
    required this.createdAt,
    required this.payment,
    this.refundReasonId,
    this.note,
    this.createdBy,
    this.refundReason,
  });

  factory AdminRefund.fromJson(Map<String, Object?> json) =>
      _$AdminRefundFromJson(json);

  /// The refund's ID.
  final String id;

  /// The refund's amount.
  final num amount;

  /// The ID of the refund reason.
  @JsonKey(name: 'refund_reason_id')
  final String? refundReasonId;

  /// More details about the refund.
  final String? note;

  /// The date the refund was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The ID of the user that created the refund.
  @JsonKey(name: 'created_by')
  final String? createdBy;
  final BasePayment payment;
  @JsonKey(name: 'refund_reason')
  final BaseRefundReason? refundReason;

  Map<String, Object?> toJson() => _$AdminRefundToJson(this);
}
