// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workflow_execution_definition.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkflowExecutionDefinition _$WorkflowExecutionDefinitionFromJson(
  Map<String, dynamic> json,
) => WorkflowExecutionDefinition(
  noWait: json['noWait'] as bool? ?? false,
  asyncValue: json['async'] as bool?,
  compensateAsync: json['compensateAsync'] as bool?,
  noCompensation: json['noCompensation'] as bool?,
  continueOnPermanentFailure: json['continueOnPermanentFailure'] as bool?,
  skipOnPermanentFailure: json['skipOnPermanentFailure'],
  maxRetries: json['maxRetries'] as num?,
  retryInterval: json['retryInterval'] as num?,
  retryIntervalAwaiting: json['retryIntervalAwaiting'] as num?,
  saveResponse: json['saveResponse'] as bool?,
  timeout: json['timeout'] as num?,
  autoRetry: json['autoRetry'] as bool?,
  maxAwaitingRetries: json['maxAwaitingRetries'] as num?,
);

Map<String, dynamic> _$WorkflowExecutionDefinitionToJson(
  WorkflowExecutionDefinition instance,
) => <String, dynamic>{
  'async': ?instance.asyncValue,
  'compensateAsync': ?instance.compensateAsync,
  'noCompensation': ?instance.noCompensation,
  'continueOnPermanentFailure': ?instance.continueOnPermanentFailure,
  'skipOnPermanentFailure': ?instance.skipOnPermanentFailure,
  'maxRetries': ?instance.maxRetries,
  'noWait': instance.noWait,
  'retryInterval': ?instance.retryInterval,
  'retryIntervalAwaiting': ?instance.retryIntervalAwaiting,
  'saveResponse': ?instance.saveResponse,
  'timeout': ?instance.timeout,
  'autoRetry': ?instance.autoRetry,
  'maxAwaitingRetries': ?instance.maxAwaitingRetries,
};
