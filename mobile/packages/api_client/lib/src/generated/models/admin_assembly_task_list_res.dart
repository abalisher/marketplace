// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_assembly_task.dart';
import 'admin_assembly_task_counts.dart';

part 'admin_assembly_task_list_res.g.dart';

@JsonSerializable()
class AdminAssemblyTaskListRes {
  const AdminAssemblyTaskListRes({
    required this.assemblyTasks,
    required this.counts,
    required this.count,
    required this.offset,
    required this.limit,
    this.group,
  });

  factory AdminAssemblyTaskListRes.fromJson(Map<String, Object?> json) =>
      _$AdminAssemblyTaskListResFromJson(json);

  @JsonKey(name: 'assembly_tasks')
  final List<AdminAssemblyTask> assemblyTasks;
  final AdminAssemblyTaskCounts counts;

  /// Группа сборщика, которой ограничена выборка (null — видны все задания).
  final String? group;
  final num count;
  final num offset;
  final num limit;

  Map<String, Object?> toJson() => _$AdminAssemblyTaskListResToJson(this);
}
