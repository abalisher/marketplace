// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_return_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderReturnResponse _$AdminOrderReturnResponseFromJson(
  Map<String, dynamic> json,
) => AdminOrderReturnResponse(
  order: Order.fromJson(json['order'] as Map<String, dynamic>),
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminOrderReturnResponseToJson(
  AdminOrderReturnResponse instance,
) => <String, dynamic>{'order': instance.order, 'return': instance.returnValue};
