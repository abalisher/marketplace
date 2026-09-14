// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_assembly_task_list_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAssemblyTaskListRes _$AdminAssemblyTaskListResFromJson(
  Map<String, dynamic> json,
) => AdminAssemblyTaskListRes(
  assemblyTasks: (json['assembly_tasks'] as List<dynamic>)
      .map((e) => AdminAssemblyTask.fromJson(e as Map<String, dynamic>))
      .toList(),
  counts: AdminAssemblyTaskCounts.fromJson(
    json['counts'] as Map<String, dynamic>,
  ),
  count: json['count'] as num,
  offset: json['offset'] as num,
  limit: json['limit'] as num,
  group: json['group'] as String?,
);

Map<String, dynamic> _$AdminAssemblyTaskListResToJson(
  AdminAssemblyTaskListRes instance,
) => <String, dynamic>{
  'assembly_tasks': instance.assemblyTasks,
  'counts': instance.counts,
  'group': ?instance.group,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
