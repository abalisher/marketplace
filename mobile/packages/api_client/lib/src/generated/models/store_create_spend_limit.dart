// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_spend_limit_period.dart';

part 'store_create_spend_limit.g.dart';

@JsonSerializable()
class StoreCreateSpendLimit {
  const StoreCreateSpendLimit({
    required this.amount,
    required this.period,
    this.currencyCode,
  });

  factory StoreCreateSpendLimit.fromJson(Map<String, Object?> json) =>
      _$StoreCreateSpendLimitFromJson(json);

  final num amount;
  final StoreCreateSpendLimitPeriod period;

  /// ISO-код валюты; по умолчанию kzt.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  Map<String, Object?> toJson() => _$StoreCreateSpendLimitToJson(this);
}
