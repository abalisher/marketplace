// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The workflow execution's state.
@JsonEnum()
enum AdminWorkflowExecutionState {
  @JsonValue('not_started')
  notStarted('not_started'),
  @JsonValue('invoking')
  invoking('invoking'),
  @JsonValue('waiting_to_compensate')
  waitingToCompensate('waiting_to_compensate'),
  @JsonValue('compensating')
  compensating('compensating'),
  @JsonValue('done')
  done('done'),
  @JsonValue('reverted')
  reverted('reverted'),
  @JsonValue('failed')
  failed('failed'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminWorkflowExecutionState(this.json);

  factory AdminWorkflowExecutionState.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminWorkflowExecutionState> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
