// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_event_actor_type.dart';
import 'admin_order_lifecycle_event_from_slot_window.dart';
import 'admin_order_lifecycle_event_kind.dart';
import 'admin_order_lifecycle_event_to_slot_window.dart';

part 'admin_order_lifecycle_event.g.dart';

@JsonSerializable()
class AdminOrderLifecycleEvent {
  const AdminOrderLifecycleEvent({
    required this.id,
    required this.toStatus,
    required this.actorType,
    this.fromStatus,
    this.actorId,
    this.reason,
    this.createdAt,
    this.actorName,
    this.kind,
    this.fromSlotDate,
    this.toSlotDate,
    this.fromSlotWindow,
    this.toSlotWindow,
  });

  factory AdminOrderLifecycleEvent.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleEventFromJson(json);

  final String id;
  @JsonKey(name: 'from_status')
  final String? fromStatus;
  @JsonKey(name: 'to_status')
  final String toStatus;
  @JsonKey(name: 'actor_type')
  final AdminOrderLifecycleEventActorType actorType;
  @JsonKey(name: 'actor_id')
  final String? actorId;
  final String? reason;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// Имя человека, сделавшего переход (учётка сотрудника или покупатель). null — переход системы или удалённая учётка: тогда подписью остаётся одна роль.
  @JsonKey(name: 'actor_name')
  final String? actorName;

  /// Род записи: переход статуса или перенос слота доставки (T5.6b).
  final AdminOrderLifecycleEventKind? kind;

  /// Дата слота до переноса (kind=slot).
  @JsonKey(name: 'from_slot_date')
  final String? fromSlotDate;

  /// Дата слота после переноса (kind=slot).
  @JsonKey(name: 'to_slot_date')
  final String? toSlotDate;

  /// Окно до переноса (kind=slot).
  @JsonKey(name: 'from_slot_window')
  final AdminOrderLifecycleEventFromSlotWindow? fromSlotWindow;

  /// Окно после переноса (kind=slot).
  @JsonKey(name: 'to_slot_window')
  final AdminOrderLifecycleEventToSlotWindow? toSlotWindow;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleEventToJson(this);
}
