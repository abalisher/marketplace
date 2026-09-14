// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_update_customer_address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreUpdateCustomerAddress _$StoreUpdateCustomerAddressFromJson(
  Map<String, dynamic> json,
) => StoreUpdateCustomerAddress(
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
  addressName: json['address_name'] as String?,
  isDefaultShipping: json['is_default_shipping'] as bool?,
  isDefaultBilling: json['is_default_billing'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$StoreUpdateCustomerAddressToJson(
  StoreUpdateCustomerAddress instance,
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
  'address_name': ?instance.addressName,
  'is_default_shipping': ?instance.isDefaultShipping,
  'is_default_billing': ?instance.isDefaultBilling,
  'metadata': ?instance.metadata,
};
