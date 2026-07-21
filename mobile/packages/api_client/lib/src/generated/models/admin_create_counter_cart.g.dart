// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_counter_cart.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateCounterCart _$AdminCreateCounterCartFromJson(
  Map<String, dynamic> json,
) => AdminCreateCounterCart(
  locationId: json['location_id'] as String,
  regionId: json['region_id'] as String?,
  email: json['email'] as String?,
  phone: json['phone'] as String?,
);

Map<String, dynamic> _$AdminCreateCounterCartToJson(
  AdminCreateCounterCart instance,
) => <String, dynamic>{
  'location_id': instance.locationId,
  'region_id': instance.regionId,
  'email': instance.email,
  'phone': instance.phone,
};
