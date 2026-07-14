// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The budget's type. `spend` means the limit is set on the total amount discounted by the campaign's promotions; `usage` means the limit is set on the total number of times the campaign's promotions can be used.
///
@JsonEnum()
enum Type {
  @JsonValue('spend')
  spend('spend'),
  @JsonValue('usage')
  usage('usage'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const Type(this.json);

  factory Type.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<Type> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
