// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_cart_bonus.g.dart';

@JsonSerializable()
class StoreCartBonus {
  const StoreCartBonus({
    required this.amount,
    required this.cartTotal,
    required this.currencyCode,
  });

  factory StoreCartBonus.fromJson(Map<String, Object?> json) =>
      _$StoreCartBonusFromJson(json);

  /// Применённая к корзине бонусная сумма (0 — бонусы не применены).
  final int amount;

  /// Тотал корзины к оплате — уже за вычетом бонусов.
  @JsonKey(name: 'cart_total')
  final num cartTotal;

  /// Валюта корзины.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  Map<String, Object?> toJson() => _$StoreCartBonusToJson(this);
}
