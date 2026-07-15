// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle_event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycleEvent _$AdminOrderLifecycleEventFromJson(
  Map<String, dynamic> json,
) => AdminOrderLifecycleEvent(
  id: json['id'] as String,
  toStatus: json['to_status'] as String,
  actorType: AdminOrderLifecycleEventActorType.fromJson(
    json['actor_type'] as String,
  ),
  fromStatus: json['from_status'] as String?,
  actorId: json['actor_id'] as String?,
  reason: json['reason'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminOrderLifecycleEventToJson(
  AdminOrderLifecycleEvent instance,
) => <String, dynamic>{
  'id': instance.id,
  'from_status': instance.fromStatus,
  'to_status': instance.toStatus,
  'actor_type': _$AdminOrderLifecycleEventActorTypeEnumMap[instance.actorType]!,
  'actor_id': instance.actorId,
  'reason': instance.reason,
  'created_at': instance.createdAt?.toIso8601String(),
};

const _$AdminOrderLifecycleEventActorTypeEnumMap = {
  AdminOrderLifecycleEventActorType.buyer: 'buyer',
  AdminOrderLifecycleEventActorType.seller: 'seller',
  AdminOrderLifecycleEventActorType.admin: 'admin',
  AdminOrderLifecycleEventActorType.system: 'system',
  AdminOrderLifecycleEventActorType.$unknown: r'$unknown',
};
