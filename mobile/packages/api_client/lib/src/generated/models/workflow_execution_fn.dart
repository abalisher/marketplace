// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'workflow_execution_fn_state.dart';
import 'workflow_execution_fn_status.dart';

part 'workflow_execution_fn.g.dart';

/// The state of the step's invokation function.
@JsonSerializable()
class WorkflowExecutionFn {
  const WorkflowExecutionFn({required this.state, required this.status});

  factory WorkflowExecutionFn.fromJson(Map<String, Object?> json) =>
      _$WorkflowExecutionFnFromJson(json);

  /// The invokation step's state.
  final WorkflowExecutionFnState state;

  /// The invokation step's state.
  final WorkflowExecutionFnStatus status;

  Map<String, Object?> toJson() => _$WorkflowExecutionFnToJson(this);
}
