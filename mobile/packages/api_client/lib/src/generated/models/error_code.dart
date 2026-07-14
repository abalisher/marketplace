// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// A slug code to indicate the type of the error.
@JsonEnum()
enum ErrorCode {
  @JsonValue('invalid_state_error')
  invalidStateError('invalid_state_error'),
  @JsonValue('invalid_request_error')
  invalidRequestError('invalid_request_error'),
  @JsonValue('api_error')
  apiError('api_error'),
  @JsonValue('unknown_error')
  unknownError('unknown_error'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const ErrorCode(this.json);

  factory ErrorCode.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<ErrorCode> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
