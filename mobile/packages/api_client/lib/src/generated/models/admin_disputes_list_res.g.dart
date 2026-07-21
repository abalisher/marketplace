// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_disputes_list_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputesListRes _$AdminDisputesListResFromJson(
  Map<String, dynamic> json,
) => AdminDisputesListRes(
  disputes: (json['disputes'] as List<dynamic>)
      .map((e) => AdminDispute.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: (json['count'] as num).toInt(),
  offset: (json['offset'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
);

Map<String, dynamic> _$AdminDisputesListResToJson(
  AdminDisputesListRes instance,
) => <String, dynamic>{
  'disputes': instance.disputes,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
