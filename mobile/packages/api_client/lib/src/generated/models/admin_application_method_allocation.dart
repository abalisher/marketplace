// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// How is the promotion amount discounted. `each` means the discounted amount is applied on each applicable item; `across` means the discounted amount is split accross the applicable items.
@JsonEnum()
enum AdminApplicationMethodAllocation {
  @JsonValue('each')
  each('each'),
  @JsonValue('across')
  across('across'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminApplicationMethodAllocation(this.json);

  factory AdminApplicationMethodAllocation.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminApplicationMethodAllocation> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
