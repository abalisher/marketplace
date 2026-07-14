// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer_address.dart';

part 'admin_customer_address_response.g.dart';

/// The address's details.
@JsonSerializable()
class AdminCustomerAddressResponse {
  const AdminCustomerAddressResponse({required this.address});

  factory AdminCustomerAddressResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerAddressResponseFromJson(json);

  final AdminCustomerAddress address;

  Map<String, Object?> toJson() => _$AdminCustomerAddressResponseToJson(this);
}
