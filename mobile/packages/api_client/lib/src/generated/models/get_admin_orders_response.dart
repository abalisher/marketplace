// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order.dart';

part 'get_admin_orders_response.g.dart';

@JsonSerializable()
class GetAdminOrdersResponse {
  const GetAdminOrdersResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.orders,
  });

  factory GetAdminOrdersResponse.fromJson(Map<String, Object?> json) =>
      _$GetAdminOrdersResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before the returned items.
  final num offset;

  /// The total count of items.
  final num count;

  /// The list of orders.
  final List<AdminOrder> orders;

  Map<String, Object?> toJson() => _$GetAdminOrdersResponseToJson(this);
}
