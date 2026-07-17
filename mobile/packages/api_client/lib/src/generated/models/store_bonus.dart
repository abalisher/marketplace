// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_bonus_transaction.dart';

part 'store_bonus.g.dart';

@JsonSerializable()
class StoreBonus {
  const StoreBonus({
    required this.balance,
    required this.currencyCode,
    required this.transactions,
    required this.count,
    required this.limit,
    required this.offset,
  });

  factory StoreBonus.fromJson(Map<String, Object?> json) =>
      _$StoreBonusFromJson(json);

  /// Текущий баланс в главных единицах валюты (KZT без тиынов).
  final int balance;
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  final List<StoreBonusTransaction> transactions;

  /// Всего операций на счёте.
  final int count;
  final int limit;
  final int offset;

  Map<String, Object?> toJson() => _$StoreBonusToJson(this);
}
