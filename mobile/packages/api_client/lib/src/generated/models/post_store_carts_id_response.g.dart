// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_store_carts_id_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PostStoreCartsIdResponse _$PostStoreCartsIdResponseFromJson(
  Map<String, dynamic> json,
) => PostStoreCartsIdResponse(
  cart: StoreCart.fromJson(json['cart'] as Map<String, dynamic>),
);

Map<String, dynamic> _$PostStoreCartsIdResponseToJson(
  PostStoreCartsIdResponse instance,
) => <String, dynamic>{'cart': instance.cart};
