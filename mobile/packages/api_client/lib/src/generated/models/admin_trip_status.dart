// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum AdminTripStatus {
  @JsonValue('planned')
  planned('planned'),
  @JsonValue('loading')
  loading('loading'),
  @JsonValue('en_route')
  enRoute('en_route'),
  @JsonValue('completed')
  completed('completed'),
  @JsonValue('canceled')
  canceled('canceled'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminTripStatus(this.json);

  factory AdminTripStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminTripStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
