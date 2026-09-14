// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_customer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardCustomer _$AdminOrderCardCustomerFromJson(
  Map<String, dynamic> json,
) => AdminOrderCardCustomer(
  isCompany: json['is_company'] as bool,
  name: json['name'] as String?,
  email: json['email'] as String?,
  phone: json['phone'] as String?,
  companyId: json['company_id'] as String?,
  companyName: json['company_name'] as String?,
  companyBin: json['company_bin'] as String?,
);

Map<String, dynamic> _$AdminOrderCardCustomerToJson(
  AdminOrderCardCustomer instance,
) => <String, dynamic>{
  'name': ?instance.name,
  'email': ?instance.email,
  'phone': ?instance.phone,
  'is_company': instance.isCompany,
  'company_id': ?instance.companyId,
  'company_name': ?instance.companyName,
  'company_bin': ?instance.companyBin,
};
