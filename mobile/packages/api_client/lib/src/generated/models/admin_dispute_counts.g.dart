// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dispute_counts.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputeCounts _$AdminDisputeCountsFromJson(Map<String, dynamic> json) =>
    AdminDisputeCounts(
      total: (json['total'] as num).toInt(),
      byStatus: Map<String, int>.from(json['by_status'] as Map),
      overdue: (json['overdue'] as num).toInt(),
    );

Map<String, dynamic> _$AdminDisputeCountsToJson(AdminDisputeCounts instance) =>
    <String, dynamic>{
      'total': instance.total,
      'by_status': instance.byStatus,
      'overdue': instance.overdue,
    };
