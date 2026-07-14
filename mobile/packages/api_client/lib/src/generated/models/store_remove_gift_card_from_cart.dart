// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_remove_gift_card_from_cart.g.dart';

/// The details to remove a gift card from the cart.
@JsonSerializable()
class StoreRemoveGiftCardFromCart {
  const StoreRemoveGiftCardFromCart({required this.code});

  factory StoreRemoveGiftCardFromCart.fromJson(Map<String, Object?> json) =>
      _$StoreRemoveGiftCardFromCartFromJson(json);

  /// The gift card code to remove from the cart.
  final String code;

  Map<String, Object?> toJson() => _$StoreRemoveGiftCardFromCartToJson(this);
}
