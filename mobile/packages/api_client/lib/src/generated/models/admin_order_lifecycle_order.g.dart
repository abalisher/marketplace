// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycleOrder _$AdminOrderLifecycleOrderFromJson(
  Map<String, dynamic> json,
) => AdminOrderLifecycleOrder(
  id: json['id'] as String,
  displayId: (json['display_id'] as num?)?.toInt(),
  email: json['email'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminOrderLifecycleOrderToJson(
  AdminOrderLifecycleOrder instance,
) => <String, dynamic>{
  'id': instance.id,
  'display_id': instance.displayId,
  'email': instance.email,
  'created_at': instance.createdAt?.toIso8601String(),
};
