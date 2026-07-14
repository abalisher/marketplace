// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_add_store_credits_to_cart.g.dart';

/// The details to add store credits to the cart.
@JsonSerializable()
class StoreAddStoreCreditsToCart {
  const StoreAddStoreCreditsToCart({required this.amount});

  factory StoreAddStoreCreditsToCart.fromJson(Map<String, Object?> json) =>
      _$StoreAddStoreCreditsToCartFromJson(json);

  /// The amount of store credits to add to the cart.
  final num amount;

  Map<String, Object?> toJson() => _$StoreAddStoreCreditsToCartToJson(this);
}
