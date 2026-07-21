// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_reviews_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreReviewsRes _$StoreReviewsResFromJson(Map<String, dynamic> json) =>
    StoreReviewsRes(
      reviews: (json['reviews'] as List<dynamic>)
          .map((e) => StoreReview.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreReviewsResToJson(StoreReviewsRes instance) =>
    <String, dynamic>{'reviews': instance.reviews};
