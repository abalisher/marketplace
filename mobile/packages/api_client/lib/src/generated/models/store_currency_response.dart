// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_currency.dart';

part 'store_currency_response.g.dart';

/// The currency's details.
@JsonSerializable()
class StoreCurrencyResponse {
  const StoreCurrencyResponse({required this.currency});

  factory StoreCurrencyResponse.fromJson(Map<String, Object?> json) =>
      _$StoreCurrencyResponseFromJson(json);

  final StoreCurrency currency;

  Map<String, Object?> toJson() => _$StoreCurrencyResponseToJson(this);
}
