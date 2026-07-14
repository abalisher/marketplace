// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_currency.g.dart';

/// The currency's currencies.
@JsonSerializable()
class AdminCurrency {
  const AdminCurrency({
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

  factory AdminCurrency.fromJson(Map<String, Object?> json) =>
      _$AdminCurrencyFromJson(json);

  /// The currency's code.
  final String code;

  /// The currency's symbol.
  final String symbol;

  /// The currency's native symbol, if different than the symbol.
  @JsonKey(name: 'symbol_native')
  final String symbolNative;

  /// The currency's name.
  final String name;

  /// The number of digits after the decimal for prices in this currency.
  @JsonKey(name: 'decimal_digits')
  final num decimalDigits;

  /// The rounding percision applied on prices in this currency.
  final num rounding;

  /// The currency's creation date.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The currency's update date.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The currency's deletion date.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminCurrencyToJson(this);
}
