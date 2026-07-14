// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_currency.g.dart';

/// The currency's details.
@JsonSerializable()
class StoreCurrency {
  const StoreCurrency({
    required this.code,
    required this.symbol,
    required this.symbolNative,
    required this.name,
    required this.decimalDigits,
    required this.rounding,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory StoreCurrency.fromJson(Map<String, Object?> json) =>
      _$StoreCurrencyFromJson(json);

  /// The currency's code.
  final String code;

  /// The currency's symbol.
  final String symbol;

  /// The currency's symbol native.
  @JsonKey(name: 'symbol_native')
  final String symbolNative;

  /// The currency's name.
  final String name;

  /// The currency's decimal digits.
  @JsonKey(name: 'decimal_digits')
  final num decimalDigits;

  /// The currency's rounding.
  final num rounding;

  /// The date the currency was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the currency was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the currency was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$StoreCurrencyToJson(this);
}
