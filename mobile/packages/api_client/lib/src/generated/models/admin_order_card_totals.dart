// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_card_totals.g.dart';

/// Итоги карточки: «Товары» + «Доставка» − «Скидка» = «Итого».
@JsonSerializable()
class AdminOrderCardTotals {
  const AdminOrderCardTotals({
    this.itemTotal,
    this.shippingTotal,
    this.discountTotal,
    this.total,
    this.currencyCode,
  });

  factory AdminOrderCardTotals.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardTotalsFromJson(json);

  @JsonKey(name: 'item_total')
  final num? itemTotal;
  @JsonKey(name: 'shipping_total')
  final num? shippingTotal;
  @JsonKey(name: 'discount_total')
  final num? discountTotal;
  final num? total;
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  Map<String, Object?> toJson() => _$AdminOrderCardTotalsToJson(this);
}
