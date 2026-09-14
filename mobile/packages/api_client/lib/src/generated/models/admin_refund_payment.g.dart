// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_refund_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRefundPayment _$AdminRefundPaymentFromJson(Map<String, dynamic> json) =>
    AdminRefundPayment(
      amount: json['amount'] as num?,
      refundReasonId: json['refund_reason_id'] as String?,
      note: json['note'] as String?,
    );

Map<String, dynamic> _$AdminRefundPaymentToJson(AdminRefundPayment instance) =>
    <String, dynamic>{
      'amount': ?instance.amount,
      'refund_reason_id': ?instance.refundReasonId,
      'note': ?instance.note,
    };
