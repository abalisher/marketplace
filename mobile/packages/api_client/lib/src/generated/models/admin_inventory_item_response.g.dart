// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_inventory_item_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInventoryItemResponse _$AdminInventoryItemResponseFromJson(
  Map<String, dynamic> json,
) => AdminInventoryItemResponse(
  inventoryItem: AdminInventoryItem.fromJson(
    json['inventory_item'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminInventoryItemResponseToJson(
  AdminInventoryItemResponse instance,
) => <String, dynamic>{'inventory_item': instance.inventoryItem};
