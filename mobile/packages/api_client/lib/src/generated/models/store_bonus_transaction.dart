// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_bonus_transaction_type.dart';

part 'store_bonus_transaction.g.dart';

@JsonSerializable()
class StoreBonusTransaction {
  const StoreBonusTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.createdAt,
    this.remaining,
    this.expiresAt,
    this.note,
  });

  factory StoreBonusTransaction.fromJson(Map<String, Object?> json) =>
      _$StoreBonusTransactionFromJson(json);

  final String id;

  /// Тип движения: accrual/manual_credit — начисление, spend/manual_debit — списание, expiry — сгорание.
  final StoreBonusTransactionType type;

  /// Сумма движения, всегда положительная — направление определяет type.
  final int amount;

  /// Несписанный остаток лота (только у начислений).
  final int? remaining;

  /// Срок сгорания лота (null — сгорание выключено).
  @JsonKey(name: 'expires_at')
  final DateTime? expiresAt;
  final String? note;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  Map<String, Object?> toJson() => _$StoreBonusTransactionToJson(this);
}
