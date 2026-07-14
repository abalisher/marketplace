// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_company.dart';
import 'store_employee.dart';

part 'store_company_registration_res.g.dart';

@JsonSerializable()
class StoreCompanyRegistrationRes {
  const StoreCompanyRegistrationRes({
    required this.company,
    required this.employee,
  });

  factory StoreCompanyRegistrationRes.fromJson(Map<String, Object?> json) =>
      _$StoreCompanyRegistrationResFromJson(json);

  final StoreCompany company;
  final StoreEmployee employee;

  Map<String, Object?> toJson() => _$StoreCompanyRegistrationResToJson(this);
}
