// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_spend_limit.dart';

part 'store_spend_limit_res.g.dart';

@JsonSerializable()
class StoreSpendLimitRes {
  const StoreSpendLimitRes({required this.spendLimit});

  factory StoreSpendLimitRes.fromJson(Map<String, Object?> json) =>
      _$StoreSpendLimitResFromJson(json);

  @JsonKey(name: 'spend_limit')
  final StoreSpendLimit spendLimit;

  Map<String, Object?> toJson() => _$StoreSpendLimitResToJson(this);
}
