// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_cart_add_promotion.g.dart';

/// The promotion's details.
@JsonSerializable()
class StoreCartAddPromotion {
  const StoreCartAddPromotion({required this.promoCodes});

  factory StoreCartAddPromotion.fromJson(Map<String, Object?> json) =>
      _$StoreCartAddPromotionFromJson(json);

  /// Promotion codes to add to the cart.
  @JsonKey(name: 'promo_codes')
  final List<String> promoCodes;

  Map<String, Object?> toJson() => _$StoreCartAddPromotionToJson(this);
}
