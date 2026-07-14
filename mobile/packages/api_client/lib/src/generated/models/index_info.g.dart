// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'index_info.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

IndexInfo _$IndexInfoFromJson(Map<String, dynamic> json) => IndexInfo(
  id: json['id'] as String,
  entity: json['entity'] as String,
  status: IndexInfoStatus.fromJson(json['status'] as String),
  fields: (json['fields'] as List<dynamic>).map((e) => e as String).toList(),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  lastSyncedKey: json['last_synced_key'] as String,
);

Map<String, dynamic> _$IndexInfoToJson(IndexInfo instance) => <String, dynamic>{
  'id': instance.id,
  'entity': instance.entity,
  'status': _$IndexInfoStatusEnumMap[instance.status]!,
  'fields': instance.fields,
  'updated_at': instance.updatedAt.toIso8601String(),
  'last_synced_key': instance.lastSyncedKey,
};

const _$IndexInfoStatusEnumMap = {
  IndexInfoStatus.pending: 'pending',
  IndexInfoStatus.error: 'error',
  IndexInfoStatus.done: 'done',
  IndexInfoStatus.processing: 'processing',
  IndexInfoStatus.$unknown: r'$unknown',
};
