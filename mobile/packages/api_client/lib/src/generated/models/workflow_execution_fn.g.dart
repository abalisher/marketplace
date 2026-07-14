// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workflow_execution_fn.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkflowExecutionFn _$WorkflowExecutionFnFromJson(Map<String, dynamic> json) =>
    WorkflowExecutionFn(
      state: WorkflowExecutionFnState.fromJson(json['state'] as String),
      status: WorkflowExecutionFnStatus.fromJson(json['status'] as String),
    );

Map<String, dynamic> _$WorkflowExecutionFnToJson(
  WorkflowExecutionFn instance,
) => <String, dynamic>{
  'state': _$WorkflowExecutionFnStateEnumMap[instance.state]!,
  'status': _$WorkflowExecutionFnStatusEnumMap[instance.status]!,
};

const _$WorkflowExecutionFnStateEnumMap = {
  WorkflowExecutionFnState.failed: 'failed',
  WorkflowExecutionFnState.notStarted: 'not_started',
  WorkflowExecutionFnState.invoking: 'invoking',
  WorkflowExecutionFnState.compensating: 'compensating',
  WorkflowExecutionFnState.done: 'done',
  WorkflowExecutionFnState.reverted: 'reverted',
  WorkflowExecutionFnState.dormant: 'dormant',
  WorkflowExecutionFnState.skipped: 'skipped',
  WorkflowExecutionFnState.skippedFailure: 'skipped_failure',
  WorkflowExecutionFnState.timeout: 'timeout',
  WorkflowExecutionFnState.$unknown: r'$unknown',
};

const _$WorkflowExecutionFnStatusEnumMap = {
  WorkflowExecutionFnStatus.idle: 'idle',
  WorkflowExecutionFnStatus.ok: 'ok',
  WorkflowExecutionFnStatus.waitingResponse: 'waiting_response',
  WorkflowExecutionFnStatus.tempFailure: 'temp_failure',
  WorkflowExecutionFnStatus.permanentFailure: 'permanent_failure',
  WorkflowExecutionFnStatus.$unknown: r'$unknown',
};
