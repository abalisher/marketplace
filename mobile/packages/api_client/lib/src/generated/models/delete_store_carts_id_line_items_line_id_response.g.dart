// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_store_carts_id_line_items_line_id_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DeleteStoreCartsIdLineItemsLineIdResponse
_$DeleteStoreCartsIdLineItemsLineIdResponseFromJson(
  Map<String, dynamic> json,
) => DeleteStoreCartsIdLineItemsLineIdResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  parent: json['parent'] == null
      ? null
      : StoreCart.fromJson(json['parent'] as Map<String, dynamic>),
  object: json['object'] as String? ?? 'line-item',
);

Map<String, dynamic> _$DeleteStoreCartsIdLineItemsLineIdResponseToJson(
  DeleteStoreCartsIdLineItemsLineIdResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
  'parent': ?instance.parent,
};
