// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_bonus_transaction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreBonusTransaction _$StoreBonusTransactionFromJson(
  Map<String, dynamic> json,
) => StoreBonusTransaction(
  id: json['id'] as String,
  type: StoreBonusTransactionType.fromJson(json['type'] as String),
  amount: (json['amount'] as num).toInt(),
  createdAt: DateTime.parse(json['created_at'] as String),
  remaining: (json['remaining'] as num?)?.toInt(),
  expiresAt: json['expires_at'] == null
      ? null
      : DateTime.parse(json['expires_at'] as String),
  note: json['note'] as String?,
);

Map<String, dynamic> _$StoreBonusTransactionToJson(
  StoreBonusTransaction instance,
) => <String, dynamic>{
  'id': instance.id,
  'type': _$StoreBonusTransactionTypeEnumMap[instance.type]!,
  'amount': instance.amount,
  'remaining': ?instance.remaining,
  'expires_at': ?instance.expiresAt?.toIso8601String(),
  'note': ?instance.note,
  'created_at': instance.createdAt.toIso8601String(),
};

const _$StoreBonusTransactionTypeEnumMap = {
  StoreBonusTransactionType.accrual: 'accrual',
  StoreBonusTransactionType.spend: 'spend',
  StoreBonusTransactionType.expiry: 'expiry',
  StoreBonusTransactionType.manualCredit: 'manual_credit',
  StoreBonusTransactionType.manualDebit: 'manual_debit',
  StoreBonusTransactionType.$unknown: r'$unknown',
};
