// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_place_order.g.dart';

@JsonSerializable()
class StorePlaceOrder {
  const StorePlaceOrder({required this.cartId});

  factory StorePlaceOrder.fromJson(Map<String, Object?> json) =>
      _$StorePlaceOrderFromJson(json);

  /// Id корзины покупателя, которую нужно завершить.
  @JsonKey(name: 'cart_id')
  final String cartId;

  Map<String, Object?> toJson() => _$StorePlaceOrderToJson(this);
}
