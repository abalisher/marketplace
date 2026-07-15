// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_status_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderStatusRes _$StoreOrderStatusResFromJson(Map<String, dynamic> json) =>
    StoreOrderStatusRes(
      orderId: json['order_id'] as String,
      status: json['status'] as String,
    );

Map<String, dynamic> _$StoreOrderStatusResToJson(
  StoreOrderStatusRes instance,
) => <String, dynamic>{'order_id': instance.orderId, 'status': instance.status};
