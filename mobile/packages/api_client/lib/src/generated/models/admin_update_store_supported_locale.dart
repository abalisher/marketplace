// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_store_supported_locale.g.dart';

/// The payload to update a store's supported locale.
@JsonSerializable()
class AdminUpdateStoreSupportedLocale {
  const AdminUpdateStoreSupportedLocale({required this.localeCode});

  factory AdminUpdateStoreSupportedLocale.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateStoreSupportedLocaleFromJson(json);

  /// The locale's code in [BCP 47 format](https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1).
  @JsonKey(name: 'locale_code')
  final String localeCode;

  Map<String, Object?> toJson() =>
      _$AdminUpdateStoreSupportedLocaleToJson(this);
}
