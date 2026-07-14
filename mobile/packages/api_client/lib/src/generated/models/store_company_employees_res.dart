// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_company_employee.dart';

part 'store_company_employees_res.g.dart';

@JsonSerializable()
class StoreCompanyEmployeesRes {
  const StoreCompanyEmployeesRes({required this.employees});

  factory StoreCompanyEmployeesRes.fromJson(Map<String, Object?> json) =>
      _$StoreCompanyEmployeesResFromJson(json);

  final List<StoreCompanyEmployee> employees;

  Map<String, Object?> toJson() => _$StoreCompanyEmployeesResToJson(this);
}
