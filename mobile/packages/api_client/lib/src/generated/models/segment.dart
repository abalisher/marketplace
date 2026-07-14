// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum Segment {
  @JsonValue('economy')
  economy('economy'),
  @JsonValue('comfort')
  comfort('comfort'),
  @JsonValue('business')
  business('business'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const Segment(this.json);

  factory Segment.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<Segment> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
