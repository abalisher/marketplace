// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_refund.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseRefund _$BaseRefundFromJson(Map<String, dynamic> json) => BaseRefund(
  id: json['id'] as String,
  amount: json['amount'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  payment: json['payment'],
  refundReasonId: json['refund_reason_id'] as String?,
  note: json['note'] as String?,
  createdBy: json['created_by'] as String?,
  refundReason: json['refund_reason'] == null
      ? null
      : BaseRefundReason.fromJson(
          json['refund_reason'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$BaseRefundToJson(BaseRefund instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amount': instance.amount,
      'refund_reason_id': instance.refundReasonId,
      'note': instance.note,
      'created_at': instance.createdAt.toIso8601String(),
      'created_by': instance.createdBy,
      'payment': instance.payment,
      'refund_reason': instance.refundReason,
    };
