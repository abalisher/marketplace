// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_inventory_level.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateInventoryLevel _$AdminUpdateInventoryLevelFromJson(
  Map<String, dynamic> json,
) => AdminUpdateInventoryLevel(
  stockedQuantity: json['stocked_quantity'] as num?,
  incomingQuantity: json['incoming_quantity'] as num?,
);

Map<String, dynamic> _$AdminUpdateInventoryLevelToJson(
  AdminUpdateInventoryLevel instance,
) => <String, dynamic>{
  'stocked_quantity': ?instance.stockedQuantity,
  'incoming_quantity': ?instance.incomingQuantity,
};
