// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The invokation step's state.
@JsonEnum()
enum WorkflowExecutionFnStatus {
  @JsonValue('idle')
  idle('idle'),
  @JsonValue('ok')
  ok('ok'),
  @JsonValue('waiting_response')
  waitingResponse('waiting_response'),
  @JsonValue('temp_failure')
  tempFailure('temp_failure'),
  @JsonValue('permanent_failure')
  permanentFailure('permanent_failure'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const WorkflowExecutionFnStatus(this.json);

  factory WorkflowExecutionFnStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<WorkflowExecutionFnStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
