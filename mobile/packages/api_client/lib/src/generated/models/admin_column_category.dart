// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The column's category.
@JsonEnum()
enum AdminColumnCategory {
  @JsonValue('status')
  status('status'),
  @JsonValue('metadata')
  metadata('metadata'),
  @JsonValue('identifier')
  identifier('identifier'),
  @JsonValue('timestamp')
  timestamp('timestamp'),
  @JsonValue('metric')
  metric('metric'),
  @JsonValue('relationship')
  relationship('relationship'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminColumnCategory(this.json);

  factory AdminColumnCategory.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminColumnCategory> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
