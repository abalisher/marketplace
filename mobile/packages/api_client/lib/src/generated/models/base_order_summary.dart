// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_order_summary.g.dart';

/// The order's summary details.
@JsonSerializable()
class BaseOrderSummary {
  const BaseOrderSummary({
    required this.paidTotal,
    required this.refundedTotal,
    required this.pendingDifference,
    required this.currentOrderTotal,
    required this.originalOrderTotal,
    required this.transactionTotal,
    required this.accountingTotal,
  });

  factory BaseOrderSummary.fromJson(Map<String, Object?> json) =>
      _$BaseOrderSummaryFromJson(json);

  /// The total amount paid.
  @JsonKey(name: 'paid_total')
  final num paidTotal;

  /// The total amount refunded.
  @JsonKey(name: 'refunded_total')
  final num refundedTotal;

  /// The difference pending to be processed. If negative, the customer needs a refund. Otherwise, additional payment is required from the customer.
  @JsonKey(name: 'pending_difference')
  final num pendingDifference;

  /// The order's current total, could be the total after a change in the order.
  @JsonKey(name: 'current_order_total')
  final num currentOrderTotal;

  /// The order's original total.
  @JsonKey(name: 'original_order_total')
  final num originalOrderTotal;

  /// The total of the transactions made on the order.
  @JsonKey(name: 'transaction_total')
  final num transactionTotal;

  /// The order's total without the credit-line total.
  @JsonKey(name: 'accounting_total')
  final num accountingTotal;

  Map<String, Object?> toJson() => _$BaseOrderSummaryToJson(this);
}
