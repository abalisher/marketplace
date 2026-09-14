// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_order.dart';
import 'admin_review.dart';
import 'admin_review_status.dart';
import 'admin_review_target.dart';

part 'admin_review_row.g.dart';

/// Строка раздела «Отзывы»: отзыв + заказ, по которому он оставлен.
@JsonSerializable()
class AdminReviewRow {
  const AdminReviewRow({
    required this.id,
    required this.orderId,
    required this.target,
    required this.rating,
    required this.status,
    required this.order,
    this.customerId,
    this.comment,
    this.createdAt,
  });

  factory AdminReviewRow.fromJson(Map<String, Object?> json) =>
      _$AdminReviewRowFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'customer_id')
  final String? customerId;
  final AdminReviewTarget target;
  final int rating;
  final String? comment;
  final AdminReviewStatus status;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final AdminOrderLifecycleOrder? order;

  Map<String, Object?> toJson() => _$AdminReviewRowToJson(this);
}
