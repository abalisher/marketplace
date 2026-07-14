// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'steps.dart';

part 'admin_workflow_execution_execution.g.dart';

/// The workflow execution's steps details.
@JsonSerializable()
class AdminWorkflowExecutionExecution {
  const AdminWorkflowExecutionExecution({required this.steps});

  factory AdminWorkflowExecutionExecution.fromJson(Map<String, Object?> json) =>
      _$AdminWorkflowExecutionExecutionFromJson(json);

  /// The execution's steps. Each object key is a step ID, and the value is the object whose properties are shown below.
  final Map<String, Steps> steps;

  Map<String, Object?> toJson() =>
      _$AdminWorkflowExecutionExecutionToJson(this);
}
