// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_delivery.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardDelivery _$AdminOrderCardDeliveryFromJson(
  Map<String, dynamic> json,
) => AdminOrderCardDelivery(
  recipient: json['recipient'] as String?,
  address: json['address'] as String?,
  city: json['city'] as String?,
  postalCode: json['postal_code'] as String?,
  phone: json['phone'] as String?,
  shippingMethod: json['shipping_method'] as String?,
  slotDate: json['slot_date'] == null
      ? null
      : DateTime.parse(json['slot_date'] as String),
  slotWindow: json['slot_window'] == null
      ? null
      : AdminOrderCardDeliverySlotWindow.fromJson(
          json['slot_window'] as String,
        ),
);

Map<String, dynamic> _$AdminOrderCardDeliveryToJson(
  AdminOrderCardDelivery instance,
) => <String, dynamic>{
  'recipient': ?instance.recipient,
  'address': ?instance.address,
  'city': ?instance.city,
  'postal_code': ?instance.postalCode,
  'phone': ?instance.phone,
  'shipping_method': ?instance.shippingMethod,
  'slot_date': ?instance.slotDate?.toIso8601String(),
  'slot_window':
      ?_$AdminOrderCardDeliverySlotWindowEnumMap[instance.slotWindow],
};

const _$AdminOrderCardDeliverySlotWindowEnumMap = {
  AdminOrderCardDeliverySlotWindow.morning: 'morning',
  AdminOrderCardDeliverySlotWindow.day: 'day',
  AdminOrderCardDeliverySlotWindow.evening: 'evening',
  AdminOrderCardDeliverySlotWindow.$unknown: r'$unknown',
};
