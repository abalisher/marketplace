// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'summary2.g.dart';

@JsonSerializable()
class Summary2 {
  const Summary2({
    required this.pendingDifference,
    required this.currentOrderTotal,
    required this.originalOrderTotal,
    required this.transactionTotal,
    required this.paidTotal,
    required this.refundedTotal,
    required this.creditLineTotal,
    required this.accountingTotal,
    required this.rawPendingDifference,
    required this.rawCurrentOrderTotal,
    required this.rawOriginalOrderTotal,
    required this.rawTransactionTotal,
    required this.rawPaidTotal,
    required this.rawRefundedTotal,
    required this.rawCreditLineTotal,
    required this.rawAccountingTotal,
  });

  factory Summary2.fromJson(Map<String, Object?> json) =>
      _$Summary2FromJson(json);

  /// The remaining amount to be paid or refunded.
  @JsonKey(name: 'pending_difference')
  final num pendingDifference;

  /// The order's current total.
  @JsonKey(name: 'current_order_total')
  final num currentOrderTotal;

  /// The order's total before any changes.
  @JsonKey(name: 'original_order_total')
  final num originalOrderTotal;

  /// The total of the transactions (payments and refunds) made on the order.
  @JsonKey(name: 'transaction_total')
  final num transactionTotal;

  /// The total paid amount.
  @JsonKey(name: 'paid_total')
  final num paidTotal;

  /// The total refunded amount.
  @JsonKey(name: 'refunded_total')
  final num refundedTotal;

  /// The total credit line amount.
  @JsonKey(name: 'credit_line_total')
  final num creditLineTotal;

  /// The total amount for accounting purposes.
  @JsonKey(name: 'accounting_total')
  final num accountingTotal;

  /// The summary's raw pending difference.
  @JsonKey(name: 'raw_pending_difference')
  final dynamic rawPendingDifference;

  /// The summary's raw current order total.
  @JsonKey(name: 'raw_current_order_total')
  final dynamic rawCurrentOrderTotal;

  /// The summary's raw original order total.
  @JsonKey(name: 'raw_original_order_total')
  final dynamic rawOriginalOrderTotal;

  /// The summary's raw transaction total.
  @JsonKey(name: 'raw_transaction_total')
  final dynamic rawTransactionTotal;

  /// The summary's raw paid total.
  @JsonKey(name: 'raw_paid_total')
  final dynamic rawPaidTotal;

  /// The summary's raw refunded total.
  @JsonKey(name: 'raw_refunded_total')
  final dynamic rawRefundedTotal;

  /// The summary's raw credit line total.
  @JsonKey(name: 'raw_credit_line_total')
  final dynamic rawCreditLineTotal;

  /// The summary's raw accounting total.
  @JsonKey(name: 'raw_accounting_total')
  final dynamic rawAccountingTotal;

  Map<String, Object?> toJson() => _$Summary2ToJson(this);
}
