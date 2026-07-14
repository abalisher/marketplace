// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_collections_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStoreCollectionsResponse _$GetStoreCollectionsResponseFromJson(
  Map<String, dynamic> json,
) => GetStoreCollectionsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  collections: (json['collections'] as List<dynamic>)
      .map((e) => StoreCollection.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$GetStoreCollectionsResponseToJson(
  GetStoreCollectionsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'collections': instance.collections,
};
