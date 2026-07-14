// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_workflow_execution.dart';

part 'admin_workflow_execution_response.g.dart';

/// The workflow execution's details.
@JsonSerializable()
class AdminWorkflowExecutionResponse {
  const AdminWorkflowExecutionResponse({required this.workflowExecution});

  factory AdminWorkflowExecutionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminWorkflowExecutionResponseFromJson(json);

  @JsonKey(name: 'workflow_execution')
  final AdminWorkflowExecution workflowExecution;

  Map<String, Object?> toJson() => _$AdminWorkflowExecutionResponseToJson(this);
}
