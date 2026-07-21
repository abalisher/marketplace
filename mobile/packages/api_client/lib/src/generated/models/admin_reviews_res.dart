// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_review.dart';

part 'admin_reviews_res.g.dart';

@JsonSerializable()
class AdminReviewsRes {
  const AdminReviewsRes({required this.reviews});

  factory AdminReviewsRes.fromJson(Map<String, Object?> json) =>
      _$AdminReviewsResFromJson(json);

  final List<AdminReview> reviews;

  Map<String, Object?> toJson() => _$AdminReviewsResToJson(this);
}
