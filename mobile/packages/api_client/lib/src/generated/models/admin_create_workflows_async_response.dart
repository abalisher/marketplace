// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_workflows_async_response_action.dart';

part 'admin_create_workflows_async_response.g.dart';

/// The details of changing a workflow execution's step status.
@JsonSerializable()
class AdminCreateWorkflowsAsyncResponse {
  const AdminCreateWorkflowsAsyncResponse({
    required this.transactionId,
    required this.stepId,
    this.response,
    this.compensateInput,
    this.action,
  });

  factory AdminCreateWorkflowsAsyncResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreateWorkflowsAsyncResponseFromJson(json);

  /// The workflows execution's transaction ID.
  @JsonKey(name: 'transaction_id')
  final String transactionId;

  /// The ID of the step whose status was changed.
  @JsonKey(name: 'step_id')
  final String stepId;

  /// Sets the step's response. It accepts any type.
  final dynamic response;

  /// Sets the compensation function's input. It accepts any response.
  @JsonKey(name: 'compensate_input')
  final dynamic compensateInput;

  /// Whether to invoke or compensate the step.
  final AdminCreateWorkflowsAsyncResponseAction? action;

  Map<String, Object?> toJson() =>
      _$AdminCreateWorkflowsAsyncResponseToJson(this);
}
