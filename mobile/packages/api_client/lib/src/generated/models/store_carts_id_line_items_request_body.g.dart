// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_carts_id_line_items_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartsIdLineItemsRequestBody _$StoreCartsIdLineItemsRequestBodyFromJson(
  Map<String, dynamic> json,
) => StoreCartsIdLineItemsRequestBody(
  variantId: json['variant_id'] as String,
  quantity: json['quantity'] as num,
  metadata: json['metadata'],
  additionalData: json['additional_data'],
);

Map<String, dynamic> _$StoreCartsIdLineItemsRequestBodyToJson(
  StoreCartsIdLineItemsRequestBody instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'quantity': instance.quantity,
  'metadata': ?instance.metadata,
  'additional_data': ?instance.additionalData,
};
