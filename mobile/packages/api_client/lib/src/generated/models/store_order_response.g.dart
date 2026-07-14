// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderResponse _$StoreOrderResponseFromJson(Map<String, dynamic> json) =>
    StoreOrderResponse(
      order: StoreOrder.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$StoreOrderResponseToJson(StoreOrderResponse instance) =>
    <String, dynamic>{'order': instance.order};
