// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_counter_cart.g.dart';

@JsonSerializable()
class AdminCreateCounterCart {
  const AdminCreateCounterCart({
    required this.locationId,
    this.regionId,
    this.email,
    this.phone,
  });

  factory AdminCreateCounterCart.fromJson(Map<String, Object?> json) =>
      _$AdminCreateCounterCartFromJson(json);

  /// Склад продавца: его pickup-опция и адрес станут контекстом корзины.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// Обязателен, только если в системе несколько регионов.
  @JsonKey(name: 'region_id')
  final String? regionId;

  /// Email покупателя для письма о заказе; без него — служебный pos@marketplace.local.
  final String? email;

  /// Телефон покупателя — привязка POS-заказа к покупателю (find-or-create по телефону, гэп 3). Без него продажа гостевая.
  final String? phone;

  Map<String, Object?> toJson() => _$AdminCreateCounterCartToJson(this);
}
