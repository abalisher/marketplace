// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_provider.dart';

part 'admin_fulfillment_provider_list_response.g.dart';

/// The paginated list of fulfillment providers.
@JsonSerializable()
class AdminFulfillmentProviderListResponse {
  const AdminFulfillmentProviderListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.fulfillmentProviders,
    this.estimateCount,
  });

  factory AdminFulfillmentProviderListResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminFulfillmentProviderListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total count of items.
  final num count;

  /// The list of fulfillment providers.
  @JsonKey(name: 'fulfillment_providers')
  final List<AdminFulfillmentProvider> fulfillmentProviders;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$AdminFulfillmentProviderListResponseToJson(this);
}
