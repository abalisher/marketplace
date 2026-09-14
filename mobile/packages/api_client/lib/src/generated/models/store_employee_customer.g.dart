// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_employee_customer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEmployeeCustomer _$StoreEmployeeCustomerFromJson(
  Map<String, dynamic> json,
) => StoreEmployeeCustomer(
  id: json['id'] as String,
  email: json['email'] as String?,
  firstName: json['first_name'] as String?,
  lastName: json['last_name'] as String?,
);

Map<String, dynamic> _$StoreEmployeeCustomerToJson(
  StoreEmployeeCustomer instance,
) => <String, dynamic>{
  'id': instance.id,
  'email': ?instance.email,
  'first_name': ?instance.firstName,
  'last_name': ?instance.lastName,
};
