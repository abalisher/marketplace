// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_slot_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderSlotRes _$AdminOrderSlotResFromJson(Map<String, dynamic> json) =>
    AdminOrderSlotRes(
      orderId: json['order_id'] as String,
      deliveryDate: json['delivery_date'] as String,
      deliveryWindow: AdminOrderSlotResDeliveryWindow.fromJson(
        json['delivery_window'] as String,
      ),
    );

Map<String, dynamic> _$AdminOrderSlotResToJson(AdminOrderSlotRes instance) =>
    <String, dynamic>{
      'order_id': instance.orderId,
      'delivery_date': instance.deliveryDate,
      'delivery_window':
          _$AdminOrderSlotResDeliveryWindowEnumMap[instance.deliveryWindow]!,
    };

const _$AdminOrderSlotResDeliveryWindowEnumMap = {
  AdminOrderSlotResDeliveryWindow.morning: 'morning',
  AdminOrderSlotResDeliveryWindow.day: 'day',
  AdminOrderSlotResDeliveryWindow.evening: 'evening',
  AdminOrderSlotResDeliveryWindow.$unknown: r'$unknown',
};
