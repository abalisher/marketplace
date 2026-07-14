// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_regions_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStoreRegionsResponse _$GetStoreRegionsResponseFromJson(
  Map<String, dynamic> json,
) => GetStoreRegionsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  regions: (json['regions'] as List<dynamic>)
      .map((e) => StoreRegion.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$GetStoreRegionsResponseToJson(
  GetStoreRegionsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'regions': instance.regions,
};
