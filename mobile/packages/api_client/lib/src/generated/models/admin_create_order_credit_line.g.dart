// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_order_credit_line.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateOrderCreditLine _$AdminCreateOrderCreditLineFromJson(
  Map<String, dynamic> json,
) => AdminCreateOrderCreditLine(
  amount: json['amount'] as num,
  reference: json['reference'] as String,
  referenceId: json['reference_id'] as String,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateOrderCreditLineToJson(
  AdminCreateOrderCreditLine instance,
) => <String, dynamic>{
  'amount': instance.amount,
  'reference': instance.reference,
  'reference_id': instance.referenceId,
  'metadata': instance.metadata,
};
