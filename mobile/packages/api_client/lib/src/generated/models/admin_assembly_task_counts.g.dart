// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_assembly_task_counts.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAssemblyTaskCounts _$AdminAssemblyTaskCountsFromJson(
  Map<String, dynamic> json,
) => AdminAssemblyTaskCounts(
  total: json['total'] as num,
  byStatus: Map<String, num>.from(json['by_status'] as Map),
);

Map<String, dynamic> _$AdminAssemblyTaskCountsToJson(
  AdminAssemblyTaskCounts instance,
) => <String, dynamic>{'total': instance.total, 'by_status': instance.byStatus};
