// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_transaction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTransaction _$AdminTransactionFromJson(Map<String, dynamic> json) =>
    AdminTransaction(
      id: json['id'] as String,
      accountId: json['account_id'] as String,
      type: AdminTransactionType.fromJson(json['type'] as String),
      amount: json['amount'] as num,
      account: AdminStoreCreditAccount.fromJson(
        json['account'] as Map<String, dynamic>,
      ),
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      note: json['note'] as String?,
      reference: json['reference'] as String?,
      referenceId: json['reference_id'] as String?,
    );

Map<String, dynamic> _$AdminTransactionToJson(AdminTransaction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'account_id': instance.accountId,
      'type': _$AdminTransactionTypeEnumMap[instance.type]!,
      'amount': instance.amount,
      'account': instance.account,
      'note': instance.note,
      'reference': instance.reference,
      'reference_id': instance.referenceId,
      'metadata': instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };

const _$AdminTransactionTypeEnumMap = {
  AdminTransactionType.credit: 'credit',
  AdminTransactionType.debit: 'debit',
  AdminTransactionType.$unknown: r'$unknown',
};
