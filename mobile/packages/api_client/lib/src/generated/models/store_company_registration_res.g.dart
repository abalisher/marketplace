// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_company_registration_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCompanyRegistrationRes _$StoreCompanyRegistrationResFromJson(
  Map<String, dynamic> json,
) => StoreCompanyRegistrationRes(
  company: StoreCompany.fromJson(json['company'] as Map<String, dynamic>),
  employee: StoreEmployee.fromJson(json['employee'] as Map<String, dynamic>),
);

Map<String, dynamic> _$StoreCompanyRegistrationResToJson(
  StoreCompanyRegistrationRes instance,
) => <String, dynamic>{
  'company': instance.company,
  'employee': instance.employee,
};
