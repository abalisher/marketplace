// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle_list_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycleListRes _$AdminOrderLifecycleListResFromJson(
  Map<String, dynamic> json,
) => AdminOrderLifecycleListRes(
  orderLifecycles: (json['order_lifecycles'] as List<dynamic>)
      .map((e) => AdminOrderLifecycle.fromJson(e as Map<String, dynamic>))
      .toList(),
  counts: AdminOrderLifecycleCounts.fromJson(
    json['counts'] as Map<String, dynamic>,
  ),
  count: (json['count'] as num).toInt(),
  offset: (json['offset'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
);

Map<String, dynamic> _$AdminOrderLifecycleListResToJson(
  AdminOrderLifecycleListRes instance,
) => <String, dynamic>{
  'order_lifecycles': instance.orderLifecycles,
  'counts': instance.counts,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
