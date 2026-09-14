// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycleRes _$AdminOrderLifecycleResFromJson(
  Map<String, dynamic> json,
) => AdminOrderLifecycleRes(
  orderId: json['order_id'] as String,
  history: (json['history'] as List<dynamic>)
      .map((e) => AdminOrderLifecycleEvent.fromJson(e as Map<String, dynamic>))
      .toList(),
  status: json['status'] as String?,
  previousStatus: json['previous_status'] as String?,
  note: json['note'] as String?,
  deliveryMethod: json['delivery_method'] == null
      ? null
      : AdminOrderLifecycleResDeliveryMethod.fromJson(
          json['delivery_method'] as String,
        ),
  deliveryDate: json['delivery_date'] == null
      ? null
      : DateTime.parse(json['delivery_date'] as String),
  deliveryWindow: json['delivery_window'] == null
      ? null
      : AdminOrderLifecycleResDeliveryWindow.fromJson(
          json['delivery_window'] as String,
        ),
);

Map<String, dynamic> _$AdminOrderLifecycleResToJson(
  AdminOrderLifecycleRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'status': ?instance.status,
  'previous_status': ?instance.previousStatus,
  'note': ?instance.note,
  'delivery_method':
      ?_$AdminOrderLifecycleResDeliveryMethodEnumMap[instance.deliveryMethod],
  'delivery_date': ?instance.deliveryDate?.toIso8601String(),
  'delivery_window':
      ?_$AdminOrderLifecycleResDeliveryWindowEnumMap[instance.deliveryWindow],
  'history': instance.history,
};

const _$AdminOrderLifecycleResDeliveryMethodEnumMap = {
  AdminOrderLifecycleResDeliveryMethod.delivery: 'delivery',
  AdminOrderLifecycleResDeliveryMethod.$unknown: r'$unknown',
};

const _$AdminOrderLifecycleResDeliveryWindowEnumMap = {
  AdminOrderLifecycleResDeliveryWindow.morning: 'morning',
  AdminOrderLifecycleResDeliveryWindow.day: 'day',
  AdminOrderLifecycleResDeliveryWindow.evening: 'evening',
  AdminOrderLifecycleResDeliveryWindow.$unknown: r'$unknown',
};
