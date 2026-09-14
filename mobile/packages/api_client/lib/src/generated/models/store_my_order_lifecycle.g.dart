// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_my_order_lifecycle.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreMyOrderLifecycle _$StoreMyOrderLifecycleFromJson(
  Map<String, dynamic> json,
) => StoreMyOrderLifecycle(
  orderId: json['order_id'] as String,
  status: json['status'] as String,
  deliveryMethod: StoreMyOrderLifecycleDeliveryMethod.fromJson(
    json['delivery_method'] as String,
  ),
  previousStatus: json['previous_status'] as String?,
  deliveryCode: json['delivery_code'] as String?,
  deliveryDate: json['delivery_date'] == null
      ? null
      : DateTime.parse(json['delivery_date'] as String),
  deliveryWindow: json['delivery_window'] == null
      ? null
      : StoreMyOrderLifecycleDeliveryWindow.fromJson(
          json['delivery_window'] as String,
        ),
);

Map<String, dynamic> _$StoreMyOrderLifecycleToJson(
  StoreMyOrderLifecycle instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'status': instance.status,
  'previous_status': ?instance.previousStatus,
  'delivery_method':
      _$StoreMyOrderLifecycleDeliveryMethodEnumMap[instance.deliveryMethod]!,
  'delivery_code': ?instance.deliveryCode,
  'delivery_date': ?instance.deliveryDate?.toIso8601String(),
  'delivery_window':
      ?_$StoreMyOrderLifecycleDeliveryWindowEnumMap[instance.deliveryWindow],
};

const _$StoreMyOrderLifecycleDeliveryMethodEnumMap = {
  StoreMyOrderLifecycleDeliveryMethod.pickup: 'pickup',
  StoreMyOrderLifecycleDeliveryMethod.delivery: 'delivery',
  StoreMyOrderLifecycleDeliveryMethod.$unknown: r'$unknown',
};

const _$StoreMyOrderLifecycleDeliveryWindowEnumMap = {
  StoreMyOrderLifecycleDeliveryWindow.morning: 'morning',
  StoreMyOrderLifecycleDeliveryWindow.day: 'day',
  StoreMyOrderLifecycleDeliveryWindow.evening: 'evening',
  StoreMyOrderLifecycleDeliveryWindow.$unknown: r'$unknown',
};
