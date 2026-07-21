// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_moderate_review_status.dart';

part 'admin_moderate_review.g.dart';

@JsonSerializable()
class AdminModerateReview {
  const AdminModerateReview({required this.status});

  factory AdminModerateReview.fromJson(Map<String, Object?> json) =>
      _$AdminModerateReviewFromJson(json);

  final AdminModerateReviewStatus status;

  Map<String, Object?> toJson() => _$AdminModerateReviewToJson(this);
}
