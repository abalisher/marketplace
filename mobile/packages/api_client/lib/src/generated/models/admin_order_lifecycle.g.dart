// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycle _$AdminOrderLifecycleFromJson(Map<String, dynamic> json) =>
    AdminOrderLifecycle(
      id: json['id'] as String,
      status: AdminOrderLifecycleStatus.fromJson(json['status'] as String),
      previousStatus: json['previous_status'] as String?,
      note: json['note'] as String?,
      deliveryMethod: json['delivery_method'] == null
          ? null
          : AdminOrderLifecycleDeliveryMethod.fromJson(
              json['delivery_method'] as String,
            ),
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      order: json['order'] == null
          ? null
          : AdminOrderLifecycleOrder.fromJson(
              json['order'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$AdminOrderLifecycleToJson(
  AdminOrderLifecycle instance,
) => <String, dynamic>{
  'id': instance.id,
  'status': _$AdminOrderLifecycleStatusEnumMap[instance.status]!,
  'previous_status': instance.previousStatus,
  'note': instance.note,
  'delivery_method':
      _$AdminOrderLifecycleDeliveryMethodEnumMap[instance.deliveryMethod],
  'created_at': instance.createdAt?.toIso8601String(),
  'updated_at': instance.updatedAt?.toIso8601String(),
  'order': instance.order,
};

const _$AdminOrderLifecycleStatusEnumMap = {
  AdminOrderLifecycleStatus.valueNew: 'new',
  AdminOrderLifecycleStatus.confirmed: 'confirmed',
  AdminOrderLifecycleStatus.assembling: 'assembling',
  AdminOrderLifecycleStatus.partiallyAssembled: 'partially_assembled',
  AdminOrderLifecycleStatus.assembled: 'assembled',
  AdminOrderLifecycleStatus.inDelivery: 'in_delivery',
  AdminOrderLifecycleStatus.delivered: 'delivered',
  AdminOrderLifecycleStatus.closed: 'closed',
  AdminOrderLifecycleStatus.canceled: 'canceled',
  AdminOrderLifecycleStatus.returned: 'returned',
  AdminOrderLifecycleStatus.$unknown: r'$unknown',
};

const _$AdminOrderLifecycleDeliveryMethodEnumMap = {
  AdminOrderLifecycleDeliveryMethod.delivery: 'delivery',
  AdminOrderLifecycleDeliveryMethod.pickup: 'pickup',
  AdminOrderLifecycleDeliveryMethod.counter: 'counter',
  AdminOrderLifecycleDeliveryMethod.$unknown: r'$unknown',
};
