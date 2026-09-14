// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_cart_item_input.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantCartItemInput _$StoreAssistantCartItemInputFromJson(
  Map<String, dynamic> json,
) => StoreAssistantCartItemInput(
  variantId: json['variant_id'] as String,
  quantity: (json['quantity'] as num).toInt(),
);

Map<String, dynamic> _$StoreAssistantCartItemInputToJson(
  StoreAssistantCartItemInput instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'quantity': instance.quantity,
};
