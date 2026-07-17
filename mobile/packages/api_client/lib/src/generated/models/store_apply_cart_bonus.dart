// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_apply_cart_bonus.g.dart';

@JsonSerializable()
class StoreApplyCartBonus {
  const StoreApplyCartBonus({required this.amount});

  factory StoreApplyCartBonus.fromJson(Map<String, Object?> json) =>
      _$StoreApplyCartBonusFromJson(json);

  /// Бонусная сумма в главных единицах валюты (KZT без тиынов).
  final int amount;

  Map<String, Object?> toJson() => _$StoreApplyCartBonusToJson(this);
}
