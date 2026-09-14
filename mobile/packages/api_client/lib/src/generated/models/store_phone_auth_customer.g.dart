// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_phone_auth_customer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePhoneAuthCustomer _$StorePhoneAuthCustomerFromJson(
  Map<String, dynamic> json,
) => StorePhoneAuthCustomer(
  id: json['id'] as String,
  phone: json['phone'] as String?,
  firstName: json['first_name'] as String?,
  lastName: json['last_name'] as String?,
  email: json['email'] as String?,
);

Map<String, dynamic> _$StorePhoneAuthCustomerToJson(
  StorePhoneAuthCustomer instance,
) => <String, dynamic>{
  'id': instance.id,
  'phone': ?instance.phone,
  'first_name': ?instance.firstName,
  'last_name': ?instance.lastName,
  'email': ?instance.email,
};
