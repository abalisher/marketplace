// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_exchange_order_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminExchangeOrderResponse _$AdminExchangeOrderResponseFromJson(
  Map<String, dynamic> json,
) => AdminExchangeOrderResponse(
  order: Order.fromJson(json['order'] as String),
  exchange: AdminExchange.fromJson(json['exchange'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminExchangeOrderResponseToJson(
  AdminExchangeOrderResponse instance,
) => <String, dynamic>{
  'order': _$OrderEnumMap[instance.order]!,
  'exchange': instance.exchange,
};

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
