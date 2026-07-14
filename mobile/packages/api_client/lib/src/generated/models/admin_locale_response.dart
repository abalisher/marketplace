// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_locale.dart';

part 'admin_locale_response.g.dart';

/// The locale's details.
@JsonSerializable()
class AdminLocaleResponse {
  const AdminLocaleResponse({required this.locale});

  factory AdminLocaleResponse.fromJson(Map<String, Object?> json) =>
      _$AdminLocaleResponseFromJson(json);

  final AdminLocale locale;

  Map<String, Object?> toJson() => _$AdminLocaleResponseToJson(this);
}
