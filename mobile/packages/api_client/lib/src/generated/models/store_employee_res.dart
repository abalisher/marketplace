// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_employee.dart';

part 'store_employee_res.g.dart';

@JsonSerializable()
class StoreEmployeeRes {
  const StoreEmployeeRes({required this.employee});

  factory StoreEmployeeRes.fromJson(Map<String, Object?> json) =>
      _$StoreEmployeeResFromJson(json);

  final StoreEmployee employee;

  Map<String, Object?> toJson() => _$StoreEmployeeResToJson(this);
}
