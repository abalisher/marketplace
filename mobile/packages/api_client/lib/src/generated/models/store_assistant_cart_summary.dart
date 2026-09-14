// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_cart_line.dart';

part 'store_assistant_cart_summary.g.dart';

@JsonSerializable()
class StoreAssistantCartSummary {
  const StoreAssistantCartSummary({
    required this.cartId,
    required this.currency,
    required this.items,
    required this.itemCount,
    required this.total,
  });

  factory StoreAssistantCartSummary.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantCartSummaryFromJson(json);

  /// Id корзины; пустая строка — корзины ещё нет.
  @JsonKey(name: 'cart_id')
  final String cartId;
  final String currency;
  final List<StoreAssistantCartLine> items;

  /// Суммарное количество единиц во всех позициях.
  @JsonKey(name: 'item_count')
  final num itemCount;

  /// Итог корзины в основной единице валюты (1500 = 1 500 ₸).
  final num total;

  Map<String, Object?> toJson() => _$StoreAssistantCartSummaryToJson(this);
}
