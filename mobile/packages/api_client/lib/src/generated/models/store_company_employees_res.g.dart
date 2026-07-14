// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_company_employees_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCompanyEmployeesRes _$StoreCompanyEmployeesResFromJson(
  Map<String, dynamic> json,
) => StoreCompanyEmployeesRes(
  employees: (json['employees'] as List<dynamic>)
      .map((e) => StoreCompanyEmployee.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreCompanyEmployeesResToJson(
  StoreCompanyEmployeesRes instance,
) => <String, dynamic>{'employees': instance.employees};
