// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum AdminRegisterDisputeCategory {
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

  const AdminRegisterDisputeCategory(this.json);

  factory AdminRegisterDisputeCategory.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminRegisterDisputeCategory> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
