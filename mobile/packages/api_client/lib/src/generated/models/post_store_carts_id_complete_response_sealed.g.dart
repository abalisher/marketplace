// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_store_carts_id_complete_response_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$PostStoreCartsIdCompleteResponseSealedToJson(
  PostStoreCartsIdCompleteResponseSealed instance,
) => <String, dynamic>{};

PostStoreCartsIdCompleteResponseSealedVariant1
_$PostStoreCartsIdCompleteResponseSealedVariant1FromJson(
  Map<String, dynamic> json,
) => PostStoreCartsIdCompleteResponseSealedVariant1(
  type: json['type'] as String,
  order: StoreOrder.fromJson(json['order'] as Map<String, dynamic>),
);

Map<String, dynamic> _$PostStoreCartsIdCompleteResponseSealedVariant1ToJson(
  PostStoreCartsIdCompleteResponseSealedVariant1 instance,
) => <String, dynamic>{'type': instance.type, 'order': instance.order};

PostStoreCartsIdCompleteResponseSealedVariant2
_$PostStoreCartsIdCompleteResponseSealedVariant2FromJson(
  Map<String, dynamic> json,
) => PostStoreCartsIdCompleteResponseSealedVariant2(
  type: json['type'] as String,
  cart: StoreCart.fromJson(json['cart'] as Map<String, dynamic>),
  error: Error.fromJson(json['error'] as Map<String, dynamic>),
);

Map<String, dynamic> _$PostStoreCartsIdCompleteResponseSealedVariant2ToJson(
  PostStoreCartsIdCompleteResponseSealedVariant2 instance,
) => <String, dynamic>{
  'type': instance.type,
  'cart': instance.cart,
  'error': instance.error,
};
