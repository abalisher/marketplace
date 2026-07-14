// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_return_reasons_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStoreReturnReasonsResponse _$GetStoreReturnReasonsResponseFromJson(
  Map<String, dynamic> json,
) => GetStoreReturnReasonsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  returnReasons: (json['return_reasons'] as List<dynamic>)
      .map((e) => StoreReturnReason.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$GetStoreReturnReasonsResponseToJson(
  GetStoreReturnReasonsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'return_reasons': instance.returnReasons,
};
