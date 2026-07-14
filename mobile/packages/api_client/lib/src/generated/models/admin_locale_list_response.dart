// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_locale.dart';

part 'admin_locale_list_response.g.dart';

/// The list of locales with pagination details.
@JsonSerializable()
class AdminLocaleListResponse {
  const AdminLocaleListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.locales,
    this.estimateCount,
  });

  factory AdminLocaleListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminLocaleListResponseFromJson(json);

  /// The maximum number of locales returned.
  final num limit;

  /// The number of locales skipped before retrieving the returned locales.
  final num offset;

  /// The total number of locales matching the query.
  final num count;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  /// The list of locales.
  final List<AdminLocale> locales;

  Map<String, Object?> toJson() => _$AdminLocaleListResponseToJson(this);
}
