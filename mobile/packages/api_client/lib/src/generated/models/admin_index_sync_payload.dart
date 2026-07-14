// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_index_sync_payload_strategy.dart';

part 'admin_index_sync_payload.g.dart';

/// The details of the index sync.
@JsonSerializable()
class AdminIndexSyncPayload {
  const AdminIndexSyncPayload({required this.strategy});

  factory AdminIndexSyncPayload.fromJson(Map<String, Object?> json) =>
      _$AdminIndexSyncPayloadFromJson(json);

  /// The syncing strategy. `full` indicates a full reindex, while `reset` truncates tables and performs a fresh sync.
  final AdminIndexSyncPayloadStrategy strategy;

  Map<String, Object?> toJson() => _$AdminIndexSyncPayloadToJson(this);
}
