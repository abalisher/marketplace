// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum AdminDisputeCategory {
  @JsonValue('not_delivered')
  notDelivered('not_delivered'),
  @JsonValue('damaged')
  damaged('damaged'),
  @JsonValue('wrong_item')
  wrongItem('wrong_item'),
  @JsonValue('quality')
  quality('quality'),
  @JsonValue('other')
  other('other'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminDisputeCategory(this.json);

  factory AdminDisputeCategory.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminDisputeCategory> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
