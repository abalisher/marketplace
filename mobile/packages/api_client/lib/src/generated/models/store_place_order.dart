// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_place_order_delivery_method.dart';

part 'store_place_order.g.dart';

@JsonSerializable()
class StorePlaceOrder {
  const StorePlaceOrder({
    required this.cartId,
    this.deliveryMethod = StorePlaceOrderDeliveryMethod.delivery,
  });

  factory StorePlaceOrder.fromJson(Map<String, Object?> json) =>
      _$StorePlaceOrderFromJson(json);

  /// Id корзины покупателя, которую нужно завершить.
  @JsonKey(name: 'cart_id')
  final String cartId;

  /// Способ получения заказа. После пивота 2026-07-22 единственный способ — доставка (приёмка по коду получения).
  @JsonKey(name: 'delivery_method')
  final StorePlaceOrderDeliveryMethod deliveryMethod;

  Map<String, Object?> toJson() => _$StorePlaceOrderToJson(this);
}
