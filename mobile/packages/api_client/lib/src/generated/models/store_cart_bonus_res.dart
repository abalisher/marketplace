// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_bonus.dart';

part 'store_cart_bonus_res.g.dart';

@JsonSerializable()
class StoreCartBonusRes {
  const StoreCartBonusRes({required this.bonus});

  factory StoreCartBonusRes.fromJson(Map<String, Object?> json) =>
      _$StoreCartBonusResFromJson(json);

  final StoreCartBonus bonus;

  Map<String, Object?> toJson() => _$StoreCartBonusResToJson(this);
}
