// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_place_counter_order.g.dart';

@JsonSerializable()
class AdminPlaceCounterOrder {
  const AdminPlaceCounterOrder({required this.cartId, this.locationId});

  factory AdminPlaceCounterOrder.fromJson(Map<String, Object?> json) =>
      _$AdminPlaceCounterOrderFromJson(json);

  /// Корзина, собранная продавцом у окна (оплата уже авторизована).
  @JsonKey(name: 'cart_id')
  final String cartId;

  /// Склад выдачи (по умолчанию — из shipping option корзины).
  @JsonKey(name: 'location_id')
  final String? locationId;

  Map<String, Object?> toJson() => _$AdminPlaceCounterOrderToJson(this);
}
