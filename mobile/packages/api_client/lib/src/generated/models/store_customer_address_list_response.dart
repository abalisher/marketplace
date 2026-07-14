// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer_address.dart';

part 'store_customer_address_list_response.g.dart';

/// The paginated list of customer addresses.
@JsonSerializable()
class StoreCustomerAddressListResponse {
  const StoreCustomerAddressListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.addresses,
    this.estimateCount,
  });

  factory StoreCustomerAddressListResponse.fromJson(
    Map<String, Object?> json,
  ) => _$StoreCustomerAddressListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of addresses.
  final List<StoreCustomerAddress> addresses;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$StoreCustomerAddressListResponseToJson(this);
}
