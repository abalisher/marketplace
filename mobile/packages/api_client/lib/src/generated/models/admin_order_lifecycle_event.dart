// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_event_actor_type.dart';

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

  Map<String, Object?> toJson() => _$AdminOrderLifecycleEventToJson(this);
}
