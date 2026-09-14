// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_fulfillment_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateFulfillmentItem _$AdminCreateFulfillmentItemFromJson(
  Map<String, dynamic> json,
) => AdminCreateFulfillmentItem(
  title: json['title'] as String,
  sku: json['sku'] as String?,
  quantity: json['quantity'] as num,
  barcode: json['barcode'] as String?,
  lineItemId: json['line_item_id'] as String?,
  inventoryItemId: json['inventory_item_id'] as String?,
);

Map<String, dynamic> _$AdminCreateFulfillmentItemToJson(
  AdminCreateFulfillmentItem instance,
) => <String, dynamic>{
  'title': instance.title,
  'sku': ?instance.sku,
  'quantity': instance.quantity,
  'barcode': ?instance.barcode,
  'line_item_id': ?instance.lineItemId,
  'inventory_item_id': ?instance.inventoryItemId,
};
