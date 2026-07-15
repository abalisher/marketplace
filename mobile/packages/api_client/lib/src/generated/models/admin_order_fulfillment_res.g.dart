// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_fulfillment_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderFulfillmentRes _$AdminOrderFulfillmentResFromJson(
  Map<String, dynamic> json,
) => AdminOrderFulfillmentRes(
  orderId: json['order_id'] as String,
  fulfillment: json['fulfillment'] == null
      ? null
      : Fulfillment.fromJson(json['fulfillment'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminOrderFulfillmentResToJson(
  AdminOrderFulfillmentRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'fulfillment': instance.fulfillment,
};
