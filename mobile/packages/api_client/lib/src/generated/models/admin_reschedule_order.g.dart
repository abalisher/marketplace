// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_reschedule_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRescheduleOrder _$AdminRescheduleOrderFromJson(
  Map<String, dynamic> json,
) => AdminRescheduleOrder(
  slotDate: json['slot_date'] as String,
  slotWindow: AdminRescheduleOrderSlotWindow.fromJson(
    json['slot_window'] as String,
  ),
  reason: json['reason'] as String,
);

Map<String, dynamic> _$AdminRescheduleOrderToJson(
  AdminRescheduleOrder instance,
) => <String, dynamic>{
  'slot_date': instance.slotDate,
  'slot_window': _$AdminRescheduleOrderSlotWindowEnumMap[instance.slotWindow]!,
  'reason': instance.reason,
};

const _$AdminRescheduleOrderSlotWindowEnumMap = {
  AdminRescheduleOrderSlotWindow.morning: 'morning',
  AdminRescheduleOrderSlotWindow.day: 'day',
  AdminRescheduleOrderSlotWindow.evening: 'evening',
  AdminRescheduleOrderSlotWindow.$unknown: r'$unknown',
};
