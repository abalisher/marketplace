// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_slot_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderSlotOption _$AdminOrderSlotOptionFromJson(
  Map<String, dynamic> json,
) => AdminOrderSlotOption(
  date: json['date'] as String,
  window: AdminOrderSlotOptionWindow.fromJson(json['window'] as String),
);

Map<String, dynamic> _$AdminOrderSlotOptionToJson(
  AdminOrderSlotOption instance,
) => <String, dynamic>{
  'date': instance.date,
  'window': _$AdminOrderSlotOptionWindowEnumMap[instance.window]!,
};

const _$AdminOrderSlotOptionWindowEnumMap = {
  AdminOrderSlotOptionWindow.morning: 'morning',
  AdminOrderSlotOptionWindow.day: 'day',
  AdminOrderSlotOptionWindow.evening: 'evening',
  AdminOrderSlotOptionWindow.$unknown: r'$unknown',
};
