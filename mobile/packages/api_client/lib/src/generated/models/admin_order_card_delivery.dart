// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_card_delivery_slot_window.dart';

part 'admin_order_card_delivery.g.dart';

/// Доставка заказа. Слота (даты и окна) в домене пока нет — только адрес, получатель и тариф.
@JsonSerializable()
class AdminOrderCardDelivery {
  const AdminOrderCardDelivery({
    this.recipient,
    this.address,
    this.city,
    this.postalCode,
    this.phone,
    this.shippingMethod,
    this.slotDate,
    this.slotWindow,
  });

  factory AdminOrderCardDelivery.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardDeliveryFromJson(json);

  final String? recipient;
  final String? address;
  final String? city;
  @JsonKey(name: 'postal_code')
  final String? postalCode;
  final String? phone;
  @JsonKey(name: 'shipping_method')
  final String? shippingMethod;

  /// Дата слота доставки в календарных сутках Астаны (YYYY-MM-DD). null — заказ оформлен до появления слотов.
  @JsonKey(name: 'slot_date')
  final DateTime? slotDate;

  /// Окно приезда машины: morning 09:00–13:00, day 13:00–17:00, evening 17:00–21:00.
  @JsonKey(name: 'slot_window')
  final AdminOrderCardDeliverySlotWindow? slotWindow;

  Map<String, Object?> toJson() => _$AdminOrderCardDeliveryToJson(this);
}
