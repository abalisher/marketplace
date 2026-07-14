// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_promotion.dart';

part 'admin_promotion_response.g.dart';

/// The promotion's details.
@JsonSerializable()
class AdminPromotionResponse {
  const AdminPromotionResponse({required this.promotion});

  factory AdminPromotionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPromotionResponseFromJson(json);

  final AdminPromotion promotion;

  Map<String, Object?> toJson() => _$AdminPromotionResponseToJson(this);
}
