// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'summary2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Summary2 _$Summary2FromJson(Map<String, dynamic> json) => Summary2(
  pendingDifference: json['pending_difference'] as num,
  currentOrderTotal: json['current_order_total'] as num,
  originalOrderTotal: json['original_order_total'] as num,
  transactionTotal: json['transaction_total'] as num,
  paidTotal: json['paid_total'] as num,
  refundedTotal: json['refunded_total'] as num,
  creditLineTotal: json['credit_line_total'] as num,
  accountingTotal: json['accounting_total'] as num,
  rawPendingDifference: json['raw_pending_difference'],
  rawCurrentOrderTotal: json['raw_current_order_total'],
  rawOriginalOrderTotal: json['raw_original_order_total'],
  rawTransactionTotal: json['raw_transaction_total'],
  rawPaidTotal: json['raw_paid_total'],
  rawRefundedTotal: json['raw_refunded_total'],
  rawCreditLineTotal: json['raw_credit_line_total'],
  rawAccountingTotal: json['raw_accounting_total'],
);

Map<String, dynamic> _$Summary2ToJson(Summary2 instance) => <String, dynamic>{
  'pending_difference': instance.pendingDifference,
  'current_order_total': instance.currentOrderTotal,
  'original_order_total': instance.originalOrderTotal,
  'transaction_total': instance.transactionTotal,
  'paid_total': instance.paidTotal,
  'refunded_total': instance.refundedTotal,
  'credit_line_total': instance.creditLineTotal,
  'accounting_total': instance.accountingTotal,
  'raw_pending_difference': ?instance.rawPendingDifference,
  'raw_current_order_total': ?instance.rawCurrentOrderTotal,
  'raw_original_order_total': ?instance.rawOriginalOrderTotal,
  'raw_transaction_total': ?instance.rawTransactionTotal,
  'raw_paid_total': ?instance.rawPaidTotal,
  'raw_refunded_total': ?instance.rawRefundedTotal,
  'raw_credit_line_total': ?instance.rawCreditLineTotal,
  'raw_accounting_total': ?instance.rawAccountingTotal,
};
