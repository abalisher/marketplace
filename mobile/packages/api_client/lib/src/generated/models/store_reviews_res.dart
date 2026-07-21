// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_review.dart';

part 'store_reviews_res.g.dart';

@JsonSerializable()
class StoreReviewsRes {
  const StoreReviewsRes({required this.reviews});

  factory StoreReviewsRes.fromJson(Map<String, Object?> json) =>
      _$StoreReviewsResFromJson(json);

  final List<StoreReview> reviews;

  Map<String, Object?> toJson() => _$StoreReviewsResToJson(this);
}
