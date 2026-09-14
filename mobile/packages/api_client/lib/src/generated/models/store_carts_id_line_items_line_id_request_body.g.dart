// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_carts_id_line_items_line_id_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartsIdLineItemsLineIdRequestBody
_$StoreCartsIdLineItemsLineIdRequestBodyFromJson(Map<String, dynamic> json) =>
    StoreCartsIdLineItemsLineIdRequestBody(
      quantity: json['quantity'] as num,
      metadata: json['metadata'],
      additionalData: json['additional_data'],
    );

Map<String, dynamic> _$StoreCartsIdLineItemsLineIdRequestBodyToJson(
  StoreCartsIdLineItemsLineIdRequestBody instance,
) => <String, dynamic>{
  'quantity': instance.quantity,
  'metadata': ?instance.metadata,
  'additional_data': ?instance.additionalData,
};
