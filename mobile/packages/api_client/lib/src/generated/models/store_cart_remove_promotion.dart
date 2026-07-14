// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_cart_remove_promotion.g.dart';

/// The promotion code to remove from the cart.
@JsonSerializable()
class StoreCartRemovePromotion {
  const StoreCartRemovePromotion({required this.promoCodes});

  factory StoreCartRemovePromotion.fromJson(Map<String, Object?> json) =>
      _$StoreCartRemovePromotionFromJson(json);

  /// The promotion code to remove from the cart.
  @JsonKey(name: 'promo_codes')
  final List<String> promoCodes;

  Map<String, Object?> toJson() => _$StoreCartRemovePromotionToJson(this);
}
