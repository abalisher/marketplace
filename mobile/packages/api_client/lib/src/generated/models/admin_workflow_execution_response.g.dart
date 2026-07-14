// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_workflow_execution_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminWorkflowExecutionResponse _$AdminWorkflowExecutionResponseFromJson(
  Map<String, dynamic> json,
) => AdminWorkflowExecutionResponse(
  workflowExecution: AdminWorkflowExecution.fromJson(
    json['workflow_execution'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminWorkflowExecutionResponseToJson(
  AdminWorkflowExecutionResponse instance,
) => <String, dynamic>{'workflow_execution': instance.workflowExecution};
