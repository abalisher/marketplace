// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_ship_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShipOrder _$AdminShipOrderFromJson(Map<String, dynamic> json) =>
    AdminShipOrder(
      fulfillmentId: json['fulfillment_id'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => AdminOrderLineInput.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminShipOrderToJson(AdminShipOrder instance) =>
    <String, dynamic>{
      'fulfillment_id': instance.fulfillmentId,
      'items': instance.items,
    };
