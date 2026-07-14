// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'by_locale.g.dart';

@JsonSerializable()
class ByLocale {
  const ByLocale({this.expected, this.translated, this.missing});

  factory ByLocale.fromJson(Map<String, Object?> json) =>
      _$ByLocaleFromJson(json);

  /// The total number of translatable fields.
  final num? expected;

  /// The number of translated fields.
  final num? translated;

  /// The number of fields that are yet to be translated.
  final num? missing;

  Map<String, Object?> toJson() => _$ByLocaleToJson(this);
}
