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
);

Map<String, dynamic> _$AdminOrderLifecycleResToJson(
  AdminOrderLifecycleRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'status': instance.status,
  'previous_status': instance.previousStatus,
  'note': instance.note,
  'delivery_method':
      _$AdminOrderLifecycleResDeliveryMethodEnumMap[instance.deliveryMethod],
  'history': instance.history,
};

const _$AdminOrderLifecycleResDeliveryMethodEnumMap = {
  AdminOrderLifecycleResDeliveryMethod.delivery: 'delivery',
  AdminOrderLifecycleResDeliveryMethod.pickup: 'pickup',
  AdminOrderLifecycleResDeliveryMethod.counter: 'counter',
  AdminOrderLifecycleResDeliveryMethod.$unknown: r'$unknown',
};
