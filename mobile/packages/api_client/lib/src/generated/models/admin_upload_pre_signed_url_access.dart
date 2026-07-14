// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The access level of the file. If `private`, the file will not be publicly accessible. The default value depends on the configured File Module Provider.
@JsonEnum()
enum AdminUploadPreSignedUrlAccess {
  @JsonValue('public')
  public('public'),
  @JsonValue('private')
  private('private'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminUploadPreSignedUrlAccess(this.json);

  factory AdminUploadPreSignedUrlAccess.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminUploadPreSignedUrlAccess> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
