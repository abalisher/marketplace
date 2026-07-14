// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_employee_customer.g.dart';

@JsonSerializable()
class StoreEmployeeCustomer {
  const StoreEmployeeCustomer({
    required this.id,
    this.email,
    this.firstName,
    this.lastName,
  });

  factory StoreEmployeeCustomer.fromJson(Map<String, Object?> json) =>
      _$StoreEmployeeCustomerFromJson(json);

  final String id;
  final String? email;
  @JsonKey(name: 'first_name')
  final String? firstName;
  @JsonKey(name: 'last_name')
  final String? lastName;

  Map<String, Object?> toJson() => _$StoreEmployeeCustomerToJson(this);
}
