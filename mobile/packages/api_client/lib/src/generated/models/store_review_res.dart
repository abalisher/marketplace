// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_review.dart';

part 'store_review_res.g.dart';

@JsonSerializable()
class StoreReviewRes {
  const StoreReviewRes({required this.review});

  factory StoreReviewRes.fromJson(Map<String, Object?> json) =>
      _$StoreReviewResFromJson(json);

  final StoreReview review;

  Map<String, Object?> toJson() => _$StoreReviewResToJson(this);
}
