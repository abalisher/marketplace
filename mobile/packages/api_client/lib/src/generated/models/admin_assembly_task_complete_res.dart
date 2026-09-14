// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_assembly_task.dart';
import 'admin_order_assembly_summary.dart';

part 'admin_assembly_task_complete_res.g.dart';

@JsonSerializable()
class AdminAssemblyTaskCompleteRes {
  const AdminAssemblyTaskCompleteRes({
    required this.assemblyTask,
    required this.orderAssembly,
  });

  factory AdminAssemblyTaskCompleteRes.fromJson(Map<String, Object?> json) =>
      _$AdminAssemblyTaskCompleteResFromJson(json);

  @JsonKey(name: 'assembly_task')
  final AdminAssemblyTask assemblyTask;
  @JsonKey(name: 'order_assembly')
  final AdminOrderAssemblySummary orderAssembly;

  Map<String, Object?> toJson() => _$AdminAssemblyTaskCompleteResToJson(this);
}
