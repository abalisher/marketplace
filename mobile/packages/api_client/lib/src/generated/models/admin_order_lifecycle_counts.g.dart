// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_lifecycle_counts.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLifecycleCounts _$AdminOrderLifecycleCountsFromJson(
  Map<String, dynamic> json,
) => AdminOrderLifecycleCounts(
  total: (json['total'] as num).toInt(),
  byStatus: Map<String, int>.from(json['by_status'] as Map),
  overdue: (json['overdue'] as num?)?.toInt(),
);

Map<String, dynamic> _$AdminOrderLifecycleCountsToJson(
  AdminOrderLifecycleCounts instance,
) => <String, dynamic>{
  'total': instance.total,
  'by_status': instance.byStatus,
  'overdue': ?instance.overdue,
};
