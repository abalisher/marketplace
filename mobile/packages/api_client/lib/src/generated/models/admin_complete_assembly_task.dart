// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_complete_assembly_task.g.dart';

@JsonSerializable()
class AdminCompleteAssemblyTask {
  const AdminCompleteAssemblyTask({this.note});

  factory AdminCompleteAssemblyTask.fromJson(Map<String, Object?> json) =>
      _$AdminCompleteAssemblyTaskFromJson(json);

  /// Комментарий сборщика (обычно причина нехватки).
  final String? note;

  Map<String, Object?> toJson() => _$AdminCompleteAssemblyTaskToJson(this);
}
