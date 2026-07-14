// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_preference.dart';

part 'admin_price_preference_list_response.g.dart';

/// The paginated list of price preferences.
@JsonSerializable()
class AdminPricePreferenceListResponse {
  const AdminPricePreferenceListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.pricePreferences,
    this.estimateCount,
  });

  factory AdminPricePreferenceListResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPricePreferenceListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total count of items.
  final num count;

  /// The list of price preferences.
  @JsonKey(name: 'price_preferences')
  final List<AdminPricePreference> pricePreferences;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$AdminPricePreferenceListResponseToJson(this);
}
