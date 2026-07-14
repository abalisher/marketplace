// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'workflow_execution_fn.dart';
import 'workflow_execution_definition.dart';

part 'steps.g.dart';

@JsonSerializable()
class Steps {
  const Steps({
    this.id,
    this.invoke,
    this.definition,
    this.compensate,
    this.depth,
    this.startedAt,
  });

  factory Steps.fromJson(Map<String, Object?> json) => _$StepsFromJson(json);

  /// The step's ID.
  final String? id;
  final WorkflowExecutionFn? invoke;
  final WorkflowExecutionDefinition? definition;
  final WorkflowExecutionFn? compensate;

  /// The step's depth in the workflow's execution.
  final num? depth;

  /// The timestamp the step started executing.
  final num? startedAt;

  Map<String, Object?> toJson() => _$StepsToJson(this);
}
