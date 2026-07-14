// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The syncing strategy. `full` indicates a full reindex, while `reset` truncates tables and performs a fresh sync.
@JsonEnum()
enum AdminIndexSyncPayloadStrategy {
  @JsonValue('full')
  full('full'),
  @JsonValue('reset')
  reset('reset'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminIndexSyncPayloadStrategy(this.json);

  factory AdminIndexSyncPayloadStrategy.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminIndexSyncPayloadStrategy> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
