// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_cart_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantCartItems _$StoreAssistantCartItemsFromJson(
  Map<String, dynamic> json,
) => StoreAssistantCartItems(
  items: (json['items'] as List<dynamic>)
      .map(
        (e) => StoreAssistantCartItemInput.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  cartId: json['cart_id'] as String?,
);

Map<String, dynamic> _$StoreAssistantCartItemsToJson(
  StoreAssistantCartItems instance,
) => <String, dynamic>{'cart_id': ?instance.cartId, 'items': instance.items};
