// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_fulfillment_delivery_address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminFulfillmentDeliveryAddress _$AdminFulfillmentDeliveryAddressFromJson(
  Map<String, dynamic> json,
) => AdminFulfillmentDeliveryAddress(
  firstName: json['first_name'] as String?,
  lastName: json['last_name'] as String?,
  phone: json['phone'] as String?,
  company: json['company'] as String?,
  address1: json['address_1'] as String?,
  address2: json['address_2'] as String?,
  city: json['city'] as String?,
  countryCode: json['country_code'] as String?,
  province: json['province'] as String?,
  postalCode: json['postal_code'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminFulfillmentDeliveryAddressToJson(
  AdminFulfillmentDeliveryAddress instance,
) => <String, dynamic>{
  'first_name': ?instance.firstName,
  'last_name': ?instance.lastName,
  'phone': ?instance.phone,
  'company': ?instance.company,
  'address_1': ?instance.address1,
  'address_2': ?instance.address2,
  'city': ?instance.city,
  'country_code': ?instance.countryCode,
  'province': ?instance.province,
  'postal_code': ?instance.postalCode,
  'metadata': ?instance.metadata,
};
