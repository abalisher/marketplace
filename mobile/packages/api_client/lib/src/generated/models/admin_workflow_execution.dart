// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_workflow_execution_execution.dart';
import 'admin_workflow_execution_state.dart';
import 'workflow_execution_context.dart';

part 'admin_workflow_execution.g.dart';

/// The workflows execution's details.
@JsonSerializable()
class AdminWorkflowExecution {
  const AdminWorkflowExecution({
    required this.id,
    required this.workflowId,
    required this.transactionId,
    required this.execution,
    required this.context,
    required this.state,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
  });

  factory AdminWorkflowExecution.fromJson(Map<String, Object?> json) =>
      _$AdminWorkflowExecutionFromJson(json);

  /// The workflow execution's ID.
  final String id;

  /// The ID of the workflow.
  @JsonKey(name: 'workflow_id')
  final String workflowId;

  /// The workflow execution's transaction ID.
  @JsonKey(name: 'transaction_id')
  final String transactionId;
  final AdminWorkflowExecutionExecution execution;
  final WorkflowExecutionContext context;

  /// The workflow execution's state.
  final AdminWorkflowExecutionState state;

  /// The date the workflow execution was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the workflow execution was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the workflow execution was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminWorkflowExecutionToJson(this);
}
