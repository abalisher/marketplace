// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_spend_limit_period.dart';

part 'store_spend_limit.g.dart';

@JsonSerializable()
class StoreSpendLimit {
  const StoreSpendLimit({
    required this.id,
    required this.amount,
    required this.currencyCode,
    required this.period,
    this.employeeId,
    this.createdAt,
    this.updatedAt,
  });

  factory StoreSpendLimit.fromJson(Map<String, Object?> json) =>
      _$StoreSpendLimitFromJson(json);

  final String id;
  final num amount;
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  final StoreSpendLimitPeriod period;
  @JsonKey(name: 'employee_id')
  final String? employeeId;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$StoreSpendLimitToJson(this);
}
