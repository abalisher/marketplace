// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_add_gift_card_to_cart.g.dart';

/// The details to add a gift card to the cart.
@JsonSerializable()
class StoreAddGiftCardToCart {
  const StoreAddGiftCardToCart({required this.code});

  factory StoreAddGiftCardToCart.fromJson(Map<String, Object?> json) =>
      _$StoreAddGiftCardToCartFromJson(json);

  /// The gift card's code.
  final String code;

  Map<String, Object?> toJson() => _$StoreAddGiftCardToCartToJson(this);
}
