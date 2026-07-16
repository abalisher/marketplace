// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_place_counter_order_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPlaceCounterOrderRes _$AdminPlaceCounterOrderResFromJson(
  Map<String, dynamic> json,
) => AdminPlaceCounterOrderRes(
  order: Order.fromJson(json['order'] as String),
  lifecycle: AdminOrderLifecycle.fromJson(
    json['lifecycle'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminPlaceCounterOrderResToJson(
  AdminPlaceCounterOrderRes instance,
) => <String, dynamic>{
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
