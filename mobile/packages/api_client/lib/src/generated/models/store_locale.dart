// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_locale.g.dart';

/// The store locale's details.
@JsonSerializable()
class StoreLocale {
  const StoreLocale({required this.code, required this.name});

  factory StoreLocale.fromJson(Map<String, Object?> json) =>
      _$StoreLocaleFromJson(json);

  /// The locale's code in [BCP 47 format](https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1).
  final String code;

  /// The locale's display name.
  final String name;

  Map<String, Object?> toJson() => _$StoreLocaleToJson(this);
}
