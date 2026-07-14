// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_index_sync_payload.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminIndexSyncPayload _$AdminIndexSyncPayloadFromJson(
  Map<String, dynamic> json,
) => AdminIndexSyncPayload(
  strategy: AdminIndexSyncPayloadStrategy.fromJson(json['strategy'] as String),
);

Map<String, dynamic> _$AdminIndexSyncPayloadToJson(
  AdminIndexSyncPayload instance,
) => <String, dynamic>{
  'strategy': _$AdminIndexSyncPayloadStrategyEnumMap[instance.strategy]!,
};

const _$AdminIndexSyncPayloadStrategyEnumMap = {
  AdminIndexSyncPayloadStrategy.full: 'full',
  AdminIndexSyncPayloadStrategy.reset: 'reset',
  AdminIndexSyncPayloadStrategy.$unknown: r'$unknown',
};
