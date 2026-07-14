// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_provider_option.dart';

part 'admin_fulfillment_provider_options_list_response.g.dart';

/// The paginated list of fulfillment options.
@JsonSerializable()
class AdminFulfillmentProviderOptionsListResponse {
  const AdminFulfillmentProviderOptionsListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.fulfillmentOptions,
    this.estimateCount,
  });

  factory AdminFulfillmentProviderOptionsListResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminFulfillmentProviderOptionsListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of fulfillment options.
  @JsonKey(name: 'fulfillment_options')
  final List<AdminFulfillmentProviderOption> fulfillmentOptions;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$AdminFulfillmentProviderOptionsListResponseToJson(this);
}
