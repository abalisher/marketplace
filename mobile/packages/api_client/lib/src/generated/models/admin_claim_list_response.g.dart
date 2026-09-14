// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimListResponse _$AdminClaimListResponseFromJson(
  Map<String, dynamic> json,
) => AdminClaimListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  claims: (json['claims'] as List<dynamic>)
      .map((e) => AdminClaim.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminClaimListResponseToJson(
  AdminClaimListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'claims': instance.claims,
  'estimate_count': ?instance.estimateCount,
};
