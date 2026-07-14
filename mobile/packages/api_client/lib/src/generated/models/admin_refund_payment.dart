// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_refund_payment.g.dart';

/// The refund's details.
@JsonSerializable()
class AdminRefundPayment {
  const AdminRefundPayment({this.amount, this.refundReasonId, this.note});

  factory AdminRefundPayment.fromJson(Map<String, Object?> json) =>
      _$AdminRefundPaymentFromJson(json);

  /// The amount to refund.
  final num? amount;

  /// The ID of a refund reason.
  @JsonKey(name: 'refund_reason_id')
  final String? refundReasonId;

  /// A note to attach to the refund.
  final String? note;

  Map<String, Object?> toJson() => _$AdminRefundPaymentToJson(this);
}
