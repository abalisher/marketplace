// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_exchange_return_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminExchangeReturnResponse _$AdminExchangeReturnResponseFromJson(
  Map<String, dynamic> json,
) => AdminExchangeReturnResponse(
  orderPreview: AdminOrderPreview.fromJson(
    json['order_preview'] as Map<String, dynamic>,
  ),
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminExchangeReturnResponseToJson(
  AdminExchangeReturnResponse instance,
) => <String, dynamic>{
  'order_preview': instance.orderPreview,
  'return': instance.returnValue,
};
