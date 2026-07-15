// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_place_order_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePlaceOrderRes _$StorePlaceOrderResFromJson(Map<String, dynamic> json) =>
    StorePlaceOrderRes(
      order: Order.fromJson(json['order'] as String),
      lifecycle: StoreOrderLifecycleSummary.fromJson(
        json['lifecycle'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$StorePlaceOrderResToJson(StorePlaceOrderRes instance) =>
    <String, dynamic>{
      'order': _$OrderEnumMap[instance.order]!,
      'lifecycle': instance.lifecycle,
    };

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
