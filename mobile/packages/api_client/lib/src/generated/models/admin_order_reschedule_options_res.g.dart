// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_reschedule_options_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderRescheduleOptionsRes _$AdminOrderRescheduleOptionsResFromJson(
  Map<String, dynamic> json,
) => AdminOrderRescheduleOptionsRes(
  orderId: json['order_id'] as String,
  canReschedule: json['can_reschedule'] as bool,
  current: Current.fromJson(json['current'] as Map<String, dynamic>),
  slots: (json['slots'] as List<dynamic>)
      .map((e) => AdminOrderSlotOption.fromJson(e as Map<String, dynamic>))
      .toList(),
  status: json['status'] as String?,
);

Map<String, dynamic> _$AdminOrderRescheduleOptionsResToJson(
  AdminOrderRescheduleOptionsRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'status': ?instance.status,
  'can_reschedule': instance.canReschedule,
  'current': instance.current,
  'slots': instance.slots,
};
