// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_locale.dart';

part 'store_locale_list_response.g.dart';

/// The list of supported locales in the store.
@JsonSerializable()
class StoreLocaleListResponse {
  const StoreLocaleListResponse({required this.locales});

  factory StoreLocaleListResponse.fromJson(Map<String, Object?> json) =>
      _$StoreLocaleListResponseFromJson(json);

  /// The list of supported locales in the store.
  final List<StoreLocale> locales;

  Map<String, Object?> toJson() => _$StoreLocaleListResponseToJson(this);
}
