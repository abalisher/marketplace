// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_status_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderStatusRes _$AdminOrderStatusResFromJson(Map<String, dynamic> json) =>
    AdminOrderStatusRes(
      orderId: json['order_id'] as String,
      status: json['status'] as String,
    );

Map<String, dynamic> _$AdminOrderStatusResToJson(
  AdminOrderStatusRes instance,
) => <String, dynamic>{'order_id': instance.orderId, 'status': instance.status};
