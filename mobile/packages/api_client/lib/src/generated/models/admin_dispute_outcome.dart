// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Последствие решения: что получает покупатель. До закрытия — null.
@JsonEnum()
enum AdminDisputeOutcome {
  @JsonValue('refund')
  refund('refund'),
  @JsonValue('redelivery')
  redelivery('redelivery'),
  @JsonValue('replacement')
  replacement('replacement'),
  @JsonValue('bonus')
  bonus('bonus'),
  @JsonValue('none')
  none('none'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminDisputeOutcome(this.json);

  factory AdminDisputeOutcome.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminDisputeOutcome> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
