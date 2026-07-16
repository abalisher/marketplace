// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_place_order_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePlaceOrderRes _$StorePlaceOrderResFromJson(Map<String, dynamic> json) =>
    StorePlaceOrderRes(
      order: Order2.fromJson(json['order'] as Map<String, dynamic>),
      lifecycle: StoreOrderLifecycleSummary.fromJson(
        json['lifecycle'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$StorePlaceOrderResToJson(StorePlaceOrderRes instance) =>
    <String, dynamic>{'order': instance.order, 'lifecycle': instance.lifecycle};
