// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_exchange_request_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminExchangeRequestResponse _$AdminExchangeRequestResponseFromJson(
  Map<String, dynamic> json,
) => AdminExchangeRequestResponse(
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
  orderPreview: AdminOrderPreview.fromJson(
    json['order_preview'] as Map<String, dynamic>,
  ),
  exchange: AdminExchange.fromJson(json['exchange'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminExchangeRequestResponseToJson(
  AdminExchangeRequestResponse instance,
) => <String, dynamic>{
  'return': instance.returnValue,
  'order_preview': instance.orderPreview,
  'exchange': instance.exchange,
};
