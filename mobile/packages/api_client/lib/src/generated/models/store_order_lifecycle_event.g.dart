// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_lifecycle_event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderLifecycleEvent _$StoreOrderLifecycleEventFromJson(
  Map<String, dynamic> json,
) => StoreOrderLifecycleEvent(
  id: json['id'] as String,
  toStatus: json['to_status'] as String,
  actorType: StoreOrderLifecycleEventActorType.fromJson(
    json['actor_type'] as String,
  ),
  fromStatus: json['from_status'] as String?,
  actorId: json['actor_id'] as String?,
  reason: json['reason'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  kind: json['kind'] == null
      ? null
      : StoreOrderLifecycleEventKind.fromJson(json['kind'] as String),
  toSlotDate: json['to_slot_date'] as String?,
  toSlotWindow: json['to_slot_window'] == null
      ? null
      : StoreOrderLifecycleEventToSlotWindow.fromJson(
          json['to_slot_window'] as String,
        ),
);

Map<String, dynamic> _$StoreOrderLifecycleEventToJson(
  StoreOrderLifecycleEvent instance,
) => <String, dynamic>{
  'id': instance.id,
  'from_status': ?instance.fromStatus,
  'to_status': instance.toStatus,
  'actor_type': _$StoreOrderLifecycleEventActorTypeEnumMap[instance.actorType]!,
  'actor_id': ?instance.actorId,
  'reason': ?instance.reason,
  'created_at': ?instance.createdAt?.toIso8601String(),
  'kind': ?_$StoreOrderLifecycleEventKindEnumMap[instance.kind],
  'to_slot_date': ?instance.toSlotDate,
  'to_slot_window':
      ?_$StoreOrderLifecycleEventToSlotWindowEnumMap[instance.toSlotWindow],
};

const _$StoreOrderLifecycleEventActorTypeEnumMap = {
  StoreOrderLifecycleEventActorType.buyer: 'buyer',
  StoreOrderLifecycleEventActorType.seller: 'seller',
  StoreOrderLifecycleEventActorType.admin: 'admin',
  StoreOrderLifecycleEventActorType.system: 'system',
  StoreOrderLifecycleEventActorType.$unknown: r'$unknown',
};

const _$StoreOrderLifecycleEventKindEnumMap = {
  StoreOrderLifecycleEventKind.status: 'status',
  StoreOrderLifecycleEventKind.slot: 'slot',
  StoreOrderLifecycleEventKind.$unknown: r'$unknown',
};

const _$StoreOrderLifecycleEventToSlotWindowEnumMap = {
  StoreOrderLifecycleEventToSlotWindow.morning: 'morning',
  StoreOrderLifecycleEventToSlotWindow.day: 'day',
  StoreOrderLifecycleEventToSlotWindow.evening: 'evening',
  StoreOrderLifecycleEventToSlotWindow.$unknown: r'$unknown',
};
