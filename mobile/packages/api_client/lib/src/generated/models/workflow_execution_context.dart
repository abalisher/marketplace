// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'data2.dart';
import 'errors.dart';

part 'workflow_execution_context.g.dart';

/// The workflow execution's context.
@JsonSerializable()
class WorkflowExecutionContext {
  const WorkflowExecutionContext({
    required this.compensate,
    required this.errors,
    this.data,
  });

  factory WorkflowExecutionContext.fromJson(Map<String, Object?> json) =>
      _$WorkflowExecutionContextFromJson(json);

  /// The context's data.
  final Data2? data;

  /// The context's compensate.
  final dynamic compensate;

  /// The context's errors.
  final List<Errors> errors;

  Map<String, Object?> toJson() => _$WorkflowExecutionContextToJson(this);
}
