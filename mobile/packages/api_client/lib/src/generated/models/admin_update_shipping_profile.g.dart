// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateShippingProfile _$AdminUpdateShippingProfileFromJson(
  Map<String, dynamic> json,
) => AdminUpdateShippingProfile(
  name: json['name'] as String?,
  type: json['type'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateShippingProfileToJson(
  AdminUpdateShippingProfile instance,
) => <String, dynamic>{
  'name': ?instance.name,
  'type': ?instance.type,
  'metadata': ?instance.metadata,
};
