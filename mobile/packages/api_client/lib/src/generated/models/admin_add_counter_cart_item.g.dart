// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_counter_cart_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddCounterCartItem _$AdminAddCounterCartItemFromJson(
  Map<String, dynamic> json,
) => AdminAddCounterCartItem(
  variantId: json['variant_id'] as String,
  quantity: (json['quantity'] as num).toInt(),
);

Map<String, dynamic> _$AdminAddCounterCartItemToJson(
  AdminAddCounterCartItem instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'quantity': instance.quantity,
};
