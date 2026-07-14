// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_company_employee_role.dart';
import 'store_employee_customer.dart';
import 'store_spend_limit.dart';

part 'store_company_employee.g.dart';

@JsonSerializable()
class StoreCompanyEmployee {
  const StoreCompanyEmployee({
    required this.id,
    required this.role,
    this.createdAt,
    this.customer,
    this.spendLimits,
  });

  factory StoreCompanyEmployee.fromJson(Map<String, Object?> json) =>
      _$StoreCompanyEmployeeFromJson(json);

  final String id;
  final StoreCompanyEmployeeRole role;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final StoreEmployeeCustomer? customer;
  @JsonKey(name: 'spend_limits')
  final List<StoreSpendLimit>? spendLimits;

  Map<String, Object?> toJson() => _$StoreCompanyEmployeeToJson(this);
}
