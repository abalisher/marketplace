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
  actorName: json['actor_name'] as String?,
  kind: json['kind'] == null
      ? null
      : AdminOrderLifecycleEventKind.fromJson(json['kind'] as String),
  fromSlotDate: json['from_slot_date'] as String?,
  toSlotDate: json['to_slot_date'] as String?,
  fromSlotWindow: json['from_slot_window'] == null
      ? null
      : AdminOrderLifecycleEventFromSlotWindow.fromJson(
          json['from_slot_window'] as String,
        ),
  toSlotWindow: json['to_slot_window'] == null
      ? null
      : AdminOrderLifecycleEventToSlotWindow.fromJson(
          json['to_slot_window'] as String,
        ),
);

Map<String, dynamic> _$AdminOrderLifecycleEventToJson(
  AdminOrderLifecycleEvent instance,
) => <String, dynamic>{
  'id': instance.id,
  'from_status': ?instance.fromStatus,
  'to_status': instance.toStatus,
  'actor_type': _$AdminOrderLifecycleEventActorTypeEnumMap[instance.actorType]!,
  'actor_id': ?instance.actorId,
  'reason': ?instance.reason,
  'created_at': ?instance.createdAt?.toIso8601String(),
  'actor_name': ?instance.actorName,
  'kind': ?_$AdminOrderLifecycleEventKindEnumMap[instance.kind],
  'from_slot_date': ?instance.fromSlotDate,
  'to_slot_date': ?instance.toSlotDate,
  'from_slot_window':
      ?_$AdminOrderLifecycleEventFromSlotWindowEnumMap[instance.fromSlotWindow],
  'to_slot_window':
      ?_$AdminOrderLifecycleEventToSlotWindowEnumMap[instance.toSlotWindow],
};

const _$AdminOrderLifecycleEventActorTypeEnumMap = {
  AdminOrderLifecycleEventActorType.buyer: 'buyer',
  AdminOrderLifecycleEventActorType.seller: 'seller',
  AdminOrderLifecycleEventActorType.admin: 'admin',
  AdminOrderLifecycleEventActorType.system: 'system',
  AdminOrderLifecycleEventActorType.$unknown: r'$unknown',
};

const _$AdminOrderLifecycleEventKindEnumMap = {
  AdminOrderLifecycleEventKind.status: 'status',
  AdminOrderLifecycleEventKind.slot: 'slot',
  AdminOrderLifecycleEventKind.$unknown: r'$unknown',
};

const _$AdminOrderLifecycleEventFromSlotWindowEnumMap = {
  AdminOrderLifecycleEventFromSlotWindow.morning: 'morning',
  AdminOrderLifecycleEventFromSlotWindow.day: 'day',
  AdminOrderLifecycleEventFromSlotWindow.evening: 'evening',
  AdminOrderLifecycleEventFromSlotWindow.$unknown: r'$unknown',
};

const _$AdminOrderLifecycleEventToSlotWindowEnumMap = {
  AdminOrderLifecycleEventToSlotWindow.morning: 'morning',
  AdminOrderLifecycleEventToSlotWindow.day: 'day',
  AdminOrderLifecycleEventToSlotWindow.evening: 'evening',
  AdminOrderLifecycleEventToSlotWindow.$unknown: r'$unknown',
};
