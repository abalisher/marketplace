// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_order_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseOrderSummary _$BaseOrderSummaryFromJson(Map<String, dynamic> json) =>
    BaseOrderSummary(
      paidTotal: json['paid_total'] as num,
      refundedTotal: json['refunded_total'] as num,
      pendingDifference: json['pending_difference'] as num,
      currentOrderTotal: json['current_order_total'] as num,
      originalOrderTotal: json['original_order_total'] as num,
      transactionTotal: json['transaction_total'] as num,
      accountingTotal: json['accounting_total'] as num,
    );

Map<String, dynamic> _$BaseOrderSummaryToJson(BaseOrderSummary instance) =>
    <String, dynamic>{
      'paid_total': instance.paidTotal,
      'refunded_total': instance.refundedTotal,
      'pending_difference': instance.pendingDifference,
      'current_order_total': instance.currentOrderTotal,
      'original_order_total': instance.originalOrderTotal,
      'transaction_total': instance.transactionTotal,
      'accounting_total': instance.accountingTotal,
    };
