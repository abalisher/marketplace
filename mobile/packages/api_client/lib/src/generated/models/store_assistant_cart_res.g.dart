// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_cart_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantCartRes _$StoreAssistantCartResFromJson(
  Map<String, dynamic> json,
) => StoreAssistantCartRes(
  cart: StoreAssistantCartSummary.fromJson(
    json['cart'] as Map<String, dynamic>,
  ),
  cartId: json['cart_id'] as String?,
);

Map<String, dynamic> _$StoreAssistantCartResToJson(
  StoreAssistantCartRes instance,
) => <String, dynamic>{'cart_id': ?instance.cartId, 'cart': instance.cart};
