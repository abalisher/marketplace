// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_cart_data_billing_address_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$UpdateCartDataBillingAddressSealedToJson(
  UpdateCartDataBillingAddressSealed instance,
) => <String, dynamic>{};

UpdateCartDataBillingAddressSealedCreateAddress
_$UpdateCartDataBillingAddressSealedCreateAddressFromJson(
  Map<String, dynamic> json,
) => UpdateCartDataBillingAddressSealedCreateAddress(
  customerId: json['customerId'] as String?,
  company: json['company'] as String?,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  address1: json['address1'] as String?,
  address2: json['address2'] as String?,
  city: json['city'] as String?,
  countryCode: json['countryCode'] as String?,
  province: json['province'] as String?,
  postalCode: json['postalCode'] as String?,
  phone: json['phone'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$UpdateCartDataBillingAddressSealedCreateAddressToJson(
  UpdateCartDataBillingAddressSealedCreateAddress instance,
) => <String, dynamic>{
  'customerId': instance.customerId,
  'company': instance.company,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'address1': instance.address1,
  'address2': instance.address2,
  'city': instance.city,
  'countryCode': instance.countryCode,
  'province': instance.province,
  'postalCode': instance.postalCode,
  'phone': instance.phone,
  'metadata': instance.metadata,
};

UpdateCartDataBillingAddressSealedUpdateAddress
_$UpdateCartDataBillingAddressSealedUpdateAddressFromJson(
  Map<String, dynamic> json,
) => UpdateCartDataBillingAddressSealedUpdateAddress(
  id: json['id'] as String,
  customerId: json['customerId'] as String?,
  company: json['company'] as String?,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  address1: json['address1'] as String?,
  address2: json['address2'] as String?,
  city: json['city'] as String?,
  countryCode: json['countryCode'] as String?,
  province: json['province'] as String?,
  postalCode: json['postalCode'] as String?,
  phone: json['phone'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$UpdateCartDataBillingAddressSealedUpdateAddressToJson(
  UpdateCartDataBillingAddressSealedUpdateAddress instance,
) => <String, dynamic>{
  'id': instance.id,
  'customerId': instance.customerId,
  'company': instance.company,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'address1': instance.address1,
  'address2': instance.address2,
  'city': instance.city,
  'countryCode': instance.countryCode,
  'province': instance.province,
  'postalCode': instance.postalCode,
  'phone': instance.phone,
  'metadata': instance.metadata,
};
