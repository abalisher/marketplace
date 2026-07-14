// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_draft_order.dart';

part 'admin_draft_order_list_response.g.dart';

/// The list of draft orders with pagination fields.
@JsonSerializable()
class AdminDraftOrderListResponse {
  const AdminDraftOrderListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.draftOrders,
    this.estimateCount,
  });

  factory AdminDraftOrderListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminDraftOrderListResponseFromJson(json);

  /// The maximum number of items retrieved.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total count of items available.
  final num count;

  /// The list of draft orders.
  @JsonKey(name: 'draft_orders')
  final List<AdminDraftOrder> draftOrders;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminDraftOrderListResponseToJson(this);
}
