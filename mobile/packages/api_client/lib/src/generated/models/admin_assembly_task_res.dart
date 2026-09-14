// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_assembly_task.dart';

part 'admin_assembly_task_res.g.dart';

@JsonSerializable()
class AdminAssemblyTaskRes {
  const AdminAssemblyTaskRes({required this.assemblyTask});

  factory AdminAssemblyTaskRes.fromJson(Map<String, Object?> json) =>
      _$AdminAssemblyTaskResFromJson(json);

  @JsonKey(name: 'assembly_task')
  final AdminAssemblyTask assemblyTask;

  Map<String, Object?> toJson() => _$AdminAssemblyTaskResToJson(this);
}
