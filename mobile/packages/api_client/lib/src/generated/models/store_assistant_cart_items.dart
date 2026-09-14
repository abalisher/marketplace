// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_cart_item_input.dart';

part 'store_assistant_cart_items.g.dart';

@JsonSerializable()
class StoreAssistantCartItems {
  const StoreAssistantCartItems({required this.items, this.cartId});

  factory StoreAssistantCartItems.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantCartItemsFromJson(json);

  /// Id корзины чата. Необязателен: если корзины ещё нет, первое положительное количество её создаёт.
  @JsonKey(name: 'cart_id')
  final String? cartId;

  /// Целевые количества позиций. Абсолютные, не приращения.
  final List<StoreAssistantCartItemInput> items;

  Map<String, Object?> toJson() => _$StoreAssistantCartItemsToJson(this);
}
