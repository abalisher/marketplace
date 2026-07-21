// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_review_status.dart';
import 'admin_review_target.dart';

part 'admin_review.g.dart';

@JsonSerializable()
class AdminReview {
  const AdminReview({
    required this.id,
    required this.orderId,
    required this.target,
    required this.rating,
    required this.status,
    this.customerId,
    this.comment,
    this.createdAt,
  });

  factory AdminReview.fromJson(Map<String, Object?> json) =>
      _$AdminReviewFromJson(json);

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

  Map<String, Object?> toJson() => _$AdminReviewToJson(this);
}
