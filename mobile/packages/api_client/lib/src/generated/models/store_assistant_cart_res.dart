// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_cart_summary.dart';

part 'store_assistant_cart_res.g.dart';

@JsonSerializable()
class StoreAssistantCartRes {
  const StoreAssistantCartRes({required this.cart, this.cartId});

  factory StoreAssistantCartRes.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantCartResFromJson(json);

  /// Актуальный id корзины (мог быть создан этим запросом). null — корзины по-прежнему нет.
  @JsonKey(name: 'cart_id')
  final String? cartId;
  final StoreAssistantCartSummary cart;

  Map<String, Object?> toJson() => _$StoreAssistantCartResToJson(this);
}
