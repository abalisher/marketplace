// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderResponse _$AdminOrderResponseFromJson(Map<String, dynamic> json) =>
    AdminOrderResponse(
      order: AdminOrder.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminOrderResponseToJson(AdminOrderResponse instance) =>
    <String, dynamic>{'order': instance.order};
