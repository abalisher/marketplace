// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_employee_role.dart';

part 'store_employee.g.dart';

@JsonSerializable()
class StoreEmployee {
  const StoreEmployee({
    required this.id,
    required this.role,
    this.companyId,
    this.createdAt,
    this.updatedAt,
  });

  factory StoreEmployee.fromJson(Map<String, Object?> json) =>
      _$StoreEmployeeFromJson(json);

  final String id;
  final StoreEmployeeRole role;
  @JsonKey(name: 'company_id')
  final String? companyId;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$StoreEmployeeToJson(this);
}
