// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_collection_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCollectionListResponse _$AdminCollectionListResponseFromJson(
  Map<String, dynamic> json,
) => AdminCollectionListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  collections: (json['collections'] as List<dynamic>)
      .map((e) => AdminCollection.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminCollectionListResponseToJson(
  AdminCollectionListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'collections': instance.collections,
  'estimate_count': ?instance.estimateCount,
};
