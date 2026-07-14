// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_return_reason_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReturnReasonListResponse _$AdminReturnReasonListResponseFromJson(
  Map<String, dynamic> json,
) => AdminReturnReasonListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  returnReasons: (json['return_reasons'] as List<dynamic>)
      .map((e) => AdminReturnReason.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminReturnReasonListResponseToJson(
  AdminReturnReasonListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'return_reasons': instance.returnReasons,
  'estimate_count': instance.estimateCount,
};
