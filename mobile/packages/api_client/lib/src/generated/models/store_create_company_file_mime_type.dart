// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum StoreCreateCompanyFileMimeType {
  /// Incorrect name has been replaced. Original name: `application/pdf`.
  @JsonValue('application/pdf')
  undefined0('application/pdf'),

  /// Incorrect name has been replaced. Original name: `image/jpeg`.
  @JsonValue('image/jpeg')
  undefined1('image/jpeg'),

  /// Incorrect name has been replaced. Original name: `image/png`.
  @JsonValue('image/png')
  undefined2('image/png'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StoreCreateCompanyFileMimeType(this.json);

  factory StoreCreateCompanyFileMimeType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StoreCreateCompanyFileMimeType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
