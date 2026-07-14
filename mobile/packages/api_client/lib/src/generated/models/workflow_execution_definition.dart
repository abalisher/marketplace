// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'workflow_execution_definition.g.dart';

/// The step's definition details.
@JsonSerializable()
class WorkflowExecutionDefinition {
  const WorkflowExecutionDefinition({
    this.noWait = false,
    this.asyncValue,
    this.compensateAsync,
    this.noCompensation,
    this.continueOnPermanentFailure,
    this.skipOnPermanentFailure,
    this.maxRetries,
    this.retryInterval,
    this.retryIntervalAwaiting,
    this.saveResponse,
    this.timeout,
    this.autoRetry,
    this.maxAwaitingRetries,
  });

  factory WorkflowExecutionDefinition.fromJson(Map<String, Object?> json) =>
      _$WorkflowExecutionDefinitionFromJson(json);

  /// Whether the step is async.
  /// The name has been replaced because it contains a keyword. Original name: `async`.
  @JsonKey(name: 'async')
  final bool? asyncValue;

  /// Whether the compensation function of the step is async.
  final bool? compensateAsync;

  /// Whether the step doesn't have a compensation function.
  final bool? noCompensation;

  /// Whether the workflow should continue executing even if its status is changed to failed.
  final bool? continueOnPermanentFailure;
  final dynamic skipOnPermanentFailure;

  /// The maximum number of times to retry the step.
  final num? maxRetries;

  /// Whether the workflow shouldn't wait for the step to finish before moving to the next step.
  final bool noWait;

  /// The interval in seconds between retry attempts when the step fails.
  final num? retryInterval;

  /// The interval in seconds to retry a step even if its status is `waiting_response`.
  final num? retryIntervalAwaiting;

  /// Whether the step's response is stored.
  final bool? saveResponse;

  /// The maximum time in seconds to wait for this step to complete. If the step exceeds this time, the step's state is changed to `timeout`, but the step continues executing.
  final num? timeout;

  /// Whether the step should be automatically retried if it fails.
  final bool? autoRetry;

  /// The maximum number of times to retry the step while it's in the `waiting_response` state.
  final num? maxAwaitingRetries;

  Map<String, Object?> toJson() => _$WorkflowExecutionDefinitionToJson(this);
}
