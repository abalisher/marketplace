// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_cart_data_shipping_address_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$UpdateCartDataShippingAddressSealedToJson(
  UpdateCartDataShippingAddressSealed instance,
) => <String, dynamic>{};

UpdateCartDataShippingAddressSealedCreateAddress
_$UpdateCartDataShippingAddressSealedCreateAddressFromJson(
  Map<String, dynamic> json,
) => UpdateCartDataShippingAddressSealedCreateAddress(
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

Map<String, dynamic> _$UpdateCartDataShippingAddressSealedCreateAddressToJson(
  UpdateCartDataShippingAddressSealedCreateAddress instance,
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

UpdateCartDataShippingAddressSealedUpdateAddress
_$UpdateCartDataShippingAddressSealedUpdateAddressFromJson(
  Map<String, dynamic> json,
) => UpdateCartDataShippingAddressSealedUpdateAddress(
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

Map<String, dynamic> _$UpdateCartDataShippingAddressSealedUpdateAddressToJson(
  UpdateCartDataShippingAddressSealedUpdateAddress instance,
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
