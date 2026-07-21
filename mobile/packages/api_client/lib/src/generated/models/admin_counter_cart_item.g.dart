// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_counter_cart_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCounterCartItem _$AdminCounterCartItemFromJson(
  Map<String, dynamic> json,
) => AdminCounterCartItem(
  id: json['id'] as String,
  title: json['title'] as String,
  quantity: (json['quantity'] as num).toInt(),
  unitPrice: json['unit_price'] as num,
  variantId: json['variant_id'] as String?,
  productId: json['product_id'] as String?,
  productTitle: json['product_title'] as String?,
  variantTitle: json['variant_title'] as String?,
  thumbnail: json['thumbnail'] as String?,
);

Map<String, dynamic> _$AdminCounterCartItemToJson(
  AdminCounterCartItem instance,
) => <String, dynamic>{
  'id': instance.id,
  'variant_id': instance.variantId,
  'product_id': instance.productId,
  'title': instance.title,
  'product_title': instance.productTitle,
  'variant_title': instance.variantTitle,
  'thumbnail': instance.thumbnail,
  'quantity': instance.quantity,
  'unit_price': instance.unitPrice,
};
