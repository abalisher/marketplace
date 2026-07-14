// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The application method's type. If it's `fixed`, the promotion discounts a fixed amount. If it's `percentage`, the promotion discounts a percentage.
@JsonEnum()
enum AdminApplicationMethodType {
  @JsonValue('fixed')
  fixed('fixed'),
  @JsonValue('percentage')
  percentage('percentage'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminApplicationMethodType(this.json);

  factory AdminApplicationMethodType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminApplicationMethodType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
