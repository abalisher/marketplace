// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_shipping_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateShippingProfile _$AdminCreateShippingProfileFromJson(
  Map<String, dynamic> json,
) => AdminCreateShippingProfile(
  name: json['name'] as String,
  type: json['type'] as String,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateShippingProfileToJson(
  AdminCreateShippingProfile instance,
) => <String, dynamic>{
  'name': instance.name,
  'type': instance.type,
  'metadata': instance.metadata,
};
