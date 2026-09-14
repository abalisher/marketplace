// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_lifecycle_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderLifecycleRes _$StoreOrderLifecycleResFromJson(
  Map<String, dynamic> json,
) => StoreOrderLifecycleRes(
  orderId: json['order_id'] as String,
  history: (json['history'] as List<dynamic>)
      .map((e) => StoreOrderLifecycleEvent.fromJson(e as Map<String, dynamic>))
      .toList(),
  status: json['status'] as String?,
  previousStatus: json['previous_status'] as String?,
  note: json['note'] as String?,
  deliveryMethod: json['delivery_method'] == null
      ? null
      : StoreOrderLifecycleResDeliveryMethod.fromJson(
          json['delivery_method'] as String,
        ),
  deliveryCode: json['delivery_code'] as String?,
  deliveryDate: json['delivery_date'] == null
      ? null
      : DateTime.parse(json['delivery_date'] as String),
  deliveryWindow: json['delivery_window'] == null
      ? null
      : StoreOrderLifecycleResDeliveryWindow.fromJson(
          json['delivery_window'] as String,
        ),
);

Map<String, dynamic> _$StoreOrderLifecycleResToJson(
  StoreOrderLifecycleRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'status': ?instance.status,
  'previous_status': ?instance.previousStatus,
  'note': ?instance.note,
  'delivery_method':
      ?_$StoreOrderLifecycleResDeliveryMethodEnumMap[instance.deliveryMethod],
  'delivery_code': ?instance.deliveryCode,
  'delivery_date': ?instance.deliveryDate?.toIso8601String(),
  'delivery_window':
      ?_$StoreOrderLifecycleResDeliveryWindowEnumMap[instance.deliveryWindow],
  'history': instance.history,
};

const _$StoreOrderLifecycleResDeliveryMethodEnumMap = {
  StoreOrderLifecycleResDeliveryMethod.delivery: 'delivery',
  StoreOrderLifecycleResDeliveryMethod.$unknown: r'$unknown',
};

const _$StoreOrderLifecycleResDeliveryWindowEnumMap = {
  StoreOrderLifecycleResDeliveryWindow.morning: 'morning',
  StoreOrderLifecycleResDeliveryWindow.day: 'day',
  StoreOrderLifecycleResDeliveryWindow.evening: 'evening',
  StoreOrderLifecycleResDeliveryWindow.$unknown: r'$unknown',
};
