// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_place_counter_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPlaceCounterOrder _$AdminPlaceCounterOrderFromJson(
  Map<String, dynamic> json,
) => AdminPlaceCounterOrder(
  cartId: json['cart_id'] as String,
  locationId: json['location_id'] as String?,
);

Map<String, dynamic> _$AdminPlaceCounterOrderToJson(
  AdminPlaceCounterOrder instance,
) => <String, dynamic>{
  'cart_id': instance.cartId,
  'location_id': ?instance.locationId,
};
