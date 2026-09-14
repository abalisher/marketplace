// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_assembly_task_counts.g.dart';

@JsonSerializable()
class AdminAssemblyTaskCounts {
  const AdminAssemblyTaskCounts({required this.total, required this.byStatus});

  factory AdminAssemblyTaskCounts.fromJson(Map<String, Object?> json) =>
      _$AdminAssemblyTaskCountsFromJson(json);

  final num total;
  @JsonKey(name: 'by_status')
  final Map<String, num> byStatus;

  Map<String, Object?> toJson() => _$AdminAssemblyTaskCountsToJson(this);
}
