// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_workflow_execution.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminWorkflowExecution _$AdminWorkflowExecutionFromJson(
  Map<String, dynamic> json,
) => AdminWorkflowExecution(
  id: json['id'] as String,
  workflowId: json['workflow_id'] as String,
  transactionId: json['transaction_id'] as String,
  execution: AdminWorkflowExecutionExecution.fromJson(
    json['execution'] as Map<String, dynamic>,
  ),
  context: WorkflowExecutionContext.fromJson(
    json['context'] as Map<String, dynamic>,
  ),
  state: AdminWorkflowExecutionState.fromJson(json['state'] as String),
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminWorkflowExecutionToJson(
  AdminWorkflowExecution instance,
) => <String, dynamic>{
  'id': instance.id,
  'workflow_id': instance.workflowId,
  'transaction_id': instance.transactionId,
  'execution': instance.execution,
  'context': instance.context,
  'state': _$AdminWorkflowExecutionStateEnumMap[instance.state]!,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': ?instance.deletedAt?.toIso8601String(),
};

const _$AdminWorkflowExecutionStateEnumMap = {
  AdminWorkflowExecutionState.notStarted: 'not_started',
  AdminWorkflowExecutionState.invoking: 'invoking',
  AdminWorkflowExecutionState.waitingToCompensate: 'waiting_to_compensate',
  AdminWorkflowExecutionState.compensating: 'compensating',
  AdminWorkflowExecutionState.done: 'done',
  AdminWorkflowExecutionState.reverted: 'reverted',
  AdminWorkflowExecutionState.failed: 'failed',
  AdminWorkflowExecutionState.$unknown: r'$unknown',
};
