// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'index_info_status.dart';

part 'index_info.g.dart';

/// The index's metadata information.
@JsonSerializable()
class IndexInfo {
  const IndexInfo({
    required this.id,
    required this.entity,
    required this.status,
    required this.fields,
    required this.updatedAt,
    required this.lastSyncedKey,
  });

  factory IndexInfo.fromJson(Map<String, Object?> json) =>
      _$IndexInfoFromJson(json);

  /// The index's ID.
  final String id;

  /// The index's entity.
  final String entity;

  /// The index's syncing or ingesting status.
  final IndexInfoStatus status;

  /// The index's fields.
  final List<String> fields;

  /// The date the index was last updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The key of the last index sync.
  @JsonKey(name: 'last_synced_key')
  final String lastSyncedKey;

  Map<String, Object?> toJson() => _$IndexInfoToJson(this);
}
