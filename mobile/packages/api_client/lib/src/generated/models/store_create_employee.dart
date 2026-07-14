// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_employee_role.dart';

part 'store_create_employee.g.dart';

@JsonSerializable()
class StoreCreateEmployee {
  const StoreCreateEmployee({required this.customerId, this.role});

  factory StoreCreateEmployee.fromJson(Map<String, Object?> json) =>
      _$StoreCreateEmployeeFromJson(json);

  @JsonKey(name: 'customer_id')
  final String customerId;
  final StoreCreateEmployeeRole? role;

  Map<String, Object?> toJson() => _$StoreCreateEmployeeToJson(this);
}
