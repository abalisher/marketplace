// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_locale.g.dart';

/// The locale's details.
@JsonSerializable()
class AdminLocale {
  const AdminLocale({
    required this.code,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminLocale.fromJson(Map<String, Object?> json) =>
      _$AdminLocaleFromJson(json);

  /// The locale's code in BCP 47 format.
  final String code;

  /// The locale's display name.
  final String name;

  /// The date and time at which the locale was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date and time at which the locale was last updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date and time at which the locale was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminLocaleToJson(this);
}
