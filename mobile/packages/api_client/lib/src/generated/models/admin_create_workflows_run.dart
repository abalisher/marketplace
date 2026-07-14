// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_workflows_run.g.dart';

/// The details of the workflow to execute.
@JsonSerializable()
class AdminCreateWorkflowsRun {
  const AdminCreateWorkflowsRun({this.input, this.transactionId});

  factory AdminCreateWorkflowsRun.fromJson(Map<String, Object?> json) =>
      _$AdminCreateWorkflowsRunFromJson(json);

  /// The input to pass to the workflow. Can be of any type.
  final dynamic input;

  /// The ID of the workflow execution's transaction.
  @JsonKey(name: 'transaction_id')
  final String? transactionId;

  Map<String, Object?> toJson() => _$AdminCreateWorkflowsRunToJson(this);
}
