// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// A slug indicating the type of the error.
@JsonEnum()
enum ErrorType {
  @JsonValue('QueryRunnerAlreadyReleasedError')
  queryRunnerAlreadyReleasedError('QueryRunnerAlreadyReleasedError'),
  @JsonValue('TransactionAlreadyStartedError')
  transactionAlreadyStartedError('TransactionAlreadyStartedError'),
  @JsonValue('TransactionNotStartedError')
  transactionNotStartedError('TransactionNotStartedError'),
  @JsonValue('conflict')
  conflict('conflict'),
  @JsonValue('unauthorized')
  unauthorized('unauthorized'),
  @JsonValue('payment_authorization_error')
  paymentAuthorizationError('payment_authorization_error'),
  @JsonValue('duplicate_error')
  duplicateError('duplicate_error'),
  @JsonValue('not_allowed')
  notAllowed('not_allowed'),
  @JsonValue('invalid_data')
  invalidData('invalid_data'),
  @JsonValue('not_found')
  notFound('not_found'),
  @JsonValue('database_error')
  databaseError('database_error'),
  @JsonValue('unexpected_state')
  unexpectedState('unexpected_state'),
  @JsonValue('invalid_argument')
  invalidArgument('invalid_argument'),
  @JsonValue('unknown_error')
  unknownError('unknown_error'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const ErrorType(this.json);

  factory ErrorType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<ErrorType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
