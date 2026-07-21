// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_reviews_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReviewsRes _$AdminReviewsResFromJson(Map<String, dynamic> json) =>
    AdminReviewsRes(
      reviews: (json['reviews'] as List<dynamic>)
          .map((e) => AdminReview.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminReviewsResToJson(AdminReviewsRes instance) =>
    <String, dynamic>{'reviews': instance.reviews};
