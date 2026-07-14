// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_currency.dart';

part 'admin_currency_response.g.dart';

/// The currency's details.
@JsonSerializable()
class AdminCurrencyResponse {
  const AdminCurrencyResponse({required this.currency});

  factory AdminCurrencyResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCurrencyResponseFromJson(json);

  final AdminCurrency currency;

  Map<String, Object?> toJson() => _$AdminCurrencyResponseToJson(this);
}
