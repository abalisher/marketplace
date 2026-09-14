// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order_lifecycle_event_actor_type.dart';
import 'store_order_lifecycle_event_kind.dart';
import 'store_order_lifecycle_event_to_slot_window.dart';

part 'store_order_lifecycle_event.g.dart';

@JsonSerializable()
class StoreOrderLifecycleEvent {
  const StoreOrderLifecycleEvent({
    required this.id,
    required this.toStatus,
    required this.actorType,
    this.fromStatus,
    this.actorId,
    this.reason,
    this.createdAt,
    this.kind,
    this.toSlotDate,
    this.toSlotWindow,
  });

  factory StoreOrderLifecycleEvent.fromJson(Map<String, Object?> json) =>
      _$StoreOrderLifecycleEventFromJson(json);

  final String id;
  @JsonKey(name: 'from_status')
  final String? fromStatus;
  @JsonKey(name: 'to_status')
  final String toStatus;
  @JsonKey(name: 'actor_type')
  final StoreOrderLifecycleEventActorType actorType;
  @JsonKey(name: 'actor_id')
  final String? actorId;
  final String? reason;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// Род записи: переход статуса или перенос окна доставки (T5.6b).
  final StoreOrderLifecycleEventKind? kind;

  /// Дата слота после переноса (kind=slot).
  @JsonKey(name: 'to_slot_date')
  final String? toSlotDate;

  /// Окно после переноса (kind=slot).
  @JsonKey(name: 'to_slot_window')
  final StoreOrderLifecycleEventToSlotWindow? toSlotWindow;

  Map<String, Object?> toJson() => _$StoreOrderLifecycleEventToJson(this);
}
