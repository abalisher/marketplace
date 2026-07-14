// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_store_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStoreListResponse _$AdminStoreListResponseFromJson(
  Map<String, dynamic> json,
) => AdminStoreListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  stores: (json['stores'] as List<dynamic>)
      .map((e) => AdminStore.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminStoreListResponseToJson(
  AdminStoreListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'stores': instance.stores,
  'estimate_count': instance.estimateCount,
};
