// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_transaction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderTransaction _$OrderTransactionFromJson(Map<String, dynamic> json) =>
    OrderTransaction(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      amount: json['amount'] as num,
      currencyCode: json['currency_code'] as String,
      reference: OrderTransactionReference.fromJson(
        json['reference'] as String,
      ),
      referenceId: json['reference_id'] as String,
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      order: json['order'],
      version: json['version'] as num,
    );

Map<String, dynamic> _$OrderTransactionToJson(OrderTransaction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'amount': instance.amount,
      'currency_code': instance.currencyCode,
      'reference': _$OrderTransactionReferenceEnumMap[instance.reference]!,
      'reference_id': instance.referenceId,
      'metadata': instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'order': instance.order,
      'version': instance.version,
    };

const _$OrderTransactionReferenceEnumMap = {
  OrderTransactionReference.capture: 'capture',
  OrderTransactionReference.refund: 'refund',
  OrderTransactionReference.$unknown: r'$unknown',
};
