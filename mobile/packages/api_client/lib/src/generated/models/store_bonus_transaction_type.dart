// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Тип движения: accrual/manual_credit — начисление, spend/manual_debit — списание, expiry — сгорание.
@JsonEnum()
enum StoreBonusTransactionType {
  @JsonValue('accrual')
  accrual('accrual'),
  @JsonValue('spend')
  spend('spend'),
  @JsonValue('expiry')
  expiry('expiry'),
  @JsonValue('manual_credit')
  manualCredit('manual_credit'),
  @JsonValue('manual_debit')
  manualDebit('manual_debit'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StoreBonusTransactionType(this.json);

  factory StoreBonusTransactionType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StoreBonusTransactionType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
