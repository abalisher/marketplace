// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_workflow_execution_execution.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminWorkflowExecutionExecution _$AdminWorkflowExecutionExecutionFromJson(
  Map<String, dynamic> json,
) => AdminWorkflowExecutionExecution(
  steps: (json['steps'] as Map<String, dynamic>).map(
    (k, e) => MapEntry(k, Steps.fromJson(e as Map<String, dynamic>)),
  ),
);

Map<String, dynamic> _$AdminWorkflowExecutionExecutionToJson(
  AdminWorkflowExecutionExecution instance,
) => <String, dynamic>{'steps': instance.steps};
