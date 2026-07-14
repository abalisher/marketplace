// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer.dart';

part 'admin_customer_response.g.dart';

/// The customer's details.
@JsonSerializable()
class AdminCustomerResponse {
  const AdminCustomerResponse({required this.customer});

  factory AdminCustomerResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerResponseFromJson(json);

  final AdminCustomer customer;

  Map<String, Object?> toJson() => _$AdminCustomerResponseToJson(this);
}
