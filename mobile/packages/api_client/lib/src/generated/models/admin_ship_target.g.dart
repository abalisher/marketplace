// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_ship_target.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShipTarget _$AdminShipTargetFromJson(Map<String, dynamic> json) =>
    AdminShipTarget(
      fulfillmentId: json['fulfillment_id'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => AdminOrderLineInput.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminShipTargetToJson(AdminShipTarget instance) =>
    <String, dynamic>{
      'fulfillment_id': instance.fulfillmentId,
      'items': instance.items,
    };
