// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_workflows_async_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateWorkflowsAsyncResponse _$AdminCreateWorkflowsAsyncResponseFromJson(
  Map<String, dynamic> json,
) => AdminCreateWorkflowsAsyncResponse(
  transactionId: json['transaction_id'] as String,
  stepId: json['step_id'] as String,
  response: json['response'],
  compensateInput: json['compensate_input'],
  action: json['action'] == null
      ? null
      : AdminCreateWorkflowsAsyncResponseAction.fromJson(
          json['action'] as String,
        ),
);

Map<String, dynamic> _$AdminCreateWorkflowsAsyncResponseToJson(
  AdminCreateWorkflowsAsyncResponse instance,
) => <String, dynamic>{
  'transaction_id': instance.transactionId,
  'step_id': instance.stepId,
  'response': instance.response,
  'compensate_input': instance.compensateInput,
  'action': _$AdminCreateWorkflowsAsyncResponseActionEnumMap[instance.action],
};

const _$AdminCreateWorkflowsAsyncResponseActionEnumMap = {
  AdminCreateWorkflowsAsyncResponseAction.invoke: 'invoke',
  AdminCreateWorkflowsAsyncResponseAction.compensate: 'compensate',
  AdminCreateWorkflowsAsyncResponseAction.$unknown: r'$unknown',
};
