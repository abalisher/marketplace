// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_assembly_task.dart';
import 'admin_order_assembly_summary.dart';

part 'admin_order_assembly_res.g.dart';

@JsonSerializable()
class AdminOrderAssemblyRes {
  const AdminOrderAssemblyRes({
    required this.orderId,
    required this.assemblyTasks,
    required this.summary,
  });

  factory AdminOrderAssemblyRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderAssemblyResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'assembly_tasks')
  final List<AdminAssemblyTask> assemblyTasks;
  final AdminOrderAssemblySummary summary;

  Map<String, Object?> toJson() => _$AdminOrderAssemblyResToJson(this);
}
