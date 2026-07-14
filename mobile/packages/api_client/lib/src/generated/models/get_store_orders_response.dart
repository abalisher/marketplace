// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order.dart';

part 'get_store_orders_response.g.dart';

@JsonSerializable()
class GetStoreOrdersResponse {
  const GetStoreOrdersResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.orders,
  });

  factory GetStoreOrdersResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreOrdersResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The order's orders.
  final List<StoreOrder> orders;

  Map<String, Object?> toJson() => _$GetStoreOrdersResponseToJson(this);
}
