// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_locale.dart';

part 'admin_store_locale.g.dart';

/// The details of a store's locale.
@JsonSerializable()
class AdminStoreLocale {
  const AdminStoreLocale({
    required this.id,
    required this.localeCode,
    required this.storeId,
    required this.locale,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminStoreLocale.fromJson(Map<String, Object?> json) =>
      _$AdminStoreLocaleFromJson(json);

  /// The locale's ID.
  final String id;

  /// The locale's code in BCP 47 format.
  @JsonKey(name: 'locale_code')
  final String localeCode;

  /// The ID of the store to which the locale belongs.
  @JsonKey(name: 'store_id')
  final String storeId;
  final AdminLocale locale;

  /// The date the locale was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the locale was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the locale was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminStoreLocaleToJson(this);
}
