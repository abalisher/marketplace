// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_option_type.dart';

part 'admin_shipping_option_type_list_response.g.dart';

/// The paginated list of shipping option types.
@JsonSerializable()
class AdminShippingOptionTypeListResponse {
  const AdminShippingOptionTypeListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.shippingOptionTypes,
    this.estimateCount,
  });

  factory AdminShippingOptionTypeListResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminShippingOptionTypeListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before returning the results.
  final num offset;

  /// The total number of items.
  final num count;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  /// The list of shipping option types.
  @JsonKey(name: 'shipping_option_types')
  final List<AdminShippingOptionType> shippingOptionTypes;

  Map<String, Object?> toJson() =>
      _$AdminShippingOptionTypeListResponseToJson(this);
}
