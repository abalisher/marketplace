// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_order_transaction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseOrderTransaction _$BaseOrderTransactionFromJson(
  Map<String, dynamic> json,
) => BaseOrderTransaction(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  amount: json['amount'] as num,
  currencyCode: json['currency_code'] as String,
  reference: BaseOrderTransactionReference.fromJson(
    json['reference'] as String,
  ),
  referenceId: json['reference_id'] as String,
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
);

Map<String, dynamic> _$BaseOrderTransactionToJson(
  BaseOrderTransaction instance,
) => <String, dynamic>{
  'id': instance.id,
  'order_id': instance.orderId,
  'amount': instance.amount,
  'currency_code': instance.currencyCode,
  'reference': _$BaseOrderTransactionReferenceEnumMap[instance.reference]!,
  'reference_id': instance.referenceId,
  'metadata': instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};

const _$BaseOrderTransactionReferenceEnumMap = {
  BaseOrderTransactionReference.capture: 'capture',
  BaseOrderTransactionReference.refund: 'refund',
  BaseOrderTransactionReference.$unknown: r'$unknown',
};
