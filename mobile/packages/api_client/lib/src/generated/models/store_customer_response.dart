// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer.dart';

part 'store_customer_response.g.dart';

/// The customer's details.
@JsonSerializable()
class StoreCustomerResponse {
  const StoreCustomerResponse({required this.customer});

  factory StoreCustomerResponse.fromJson(Map<String, Object?> json) =>
      _$StoreCustomerResponseFromJson(json);

  final StoreCustomer customer;

  Map<String, Object?> toJson() => _$StoreCustomerResponseToJson(this);
}
