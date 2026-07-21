// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_review_target.dart';

part 'store_create_review.g.dart';

@JsonSerializable()
class StoreCreateReview {
  const StoreCreateReview({
    required this.target,
    required this.rating,
    this.comment,
  });

  factory StoreCreateReview.fromJson(Map<String, Object?> json) =>
      _$StoreCreateReviewFromJson(json);

  /// Объект оценки: поставщик или доставка.
  final StoreCreateReviewTarget target;
  final int rating;
  final String? comment;

  Map<String, Object?> toJson() => _$StoreCreateReviewToJson(this);
}
