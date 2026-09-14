// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_queue_counts.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingQueueCounts _$AdminShippingQueueCountsFromJson(
  Map<String, dynamic> json,
) => AdminShippingQueueCounts(
  total: json['total'] as num,
  byStage: ByStage.fromJson(json['by_stage'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminShippingQueueCountsToJson(
  AdminShippingQueueCounts instance,
) => <String, dynamic>{'total': instance.total, 'by_stage': instance.byStage};
