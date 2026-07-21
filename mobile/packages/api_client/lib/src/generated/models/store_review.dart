// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_review_status.dart';
import 'store_review_target.dart';

part 'store_review.g.dart';

@JsonSerializable()
class StoreReview {
  const StoreReview({
    required this.id,
    required this.orderId,
    required this.target,
    required this.rating,
    required this.status,
    this.comment,
    this.createdAt,
  });

  factory StoreReview.fromJson(Map<String, Object?> json) =>
      _$StoreReviewFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  final StoreReviewTarget target;
  final int rating;
  final String? comment;
  final StoreReviewStatus status;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$StoreReviewToJson(this);
}
