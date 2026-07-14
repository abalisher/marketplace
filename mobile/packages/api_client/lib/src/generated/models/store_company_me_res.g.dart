// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_company_me_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCompanyMeRes _$StoreCompanyMeResFromJson(Map<String, dynamic> json) =>
    StoreCompanyMeRes(
      company: StoreCompany.fromJson(json['company'] as Map<String, dynamic>),
      employee: StoreEmployee.fromJson(
        json['employee'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$StoreCompanyMeResToJson(StoreCompanyMeRes instance) =>
    <String, dynamic>{
      'company': instance.company,
      'employee': instance.employee,
    };
