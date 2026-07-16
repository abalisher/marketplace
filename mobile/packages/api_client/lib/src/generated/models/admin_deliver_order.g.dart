// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_deliver_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDeliverOrder _$AdminDeliverOrderFromJson(Map<String, dynamic> json) =>
    AdminDeliverOrder(
      fulfillmentId: json['fulfillment_id'] as String,
      deliveryCode: json['delivery_code'] as String?,
    );

Map<String, dynamic> _$AdminDeliverOrderToJson(AdminDeliverOrder instance) =>
    <String, dynamic>{
      'fulfillment_id': instance.fulfillmentId,
      'delivery_code': instance.deliveryCode,
    };
