// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The invokation step's state.
@JsonEnum()
enum WorkflowExecutionFnState {
  @JsonValue('failed')
  failed('failed'),
  @JsonValue('not_started')
  notStarted('not_started'),
  @JsonValue('invoking')
  invoking('invoking'),
  @JsonValue('compensating')
  compensating('compensating'),
  @JsonValue('done')
  done('done'),
  @JsonValue('reverted')
  reverted('reverted'),
  @JsonValue('dormant')
  dormant('dormant'),
  @JsonValue('skipped')
  skipped('skipped'),
  @JsonValue('skipped_failure')
  skippedFailure('skipped_failure'),
  @JsonValue('timeout')
  timeout('timeout'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const WorkflowExecutionFnState(this.json);

  factory WorkflowExecutionFnState.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<WorkflowExecutionFnState> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
