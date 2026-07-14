// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer_address.dart';

part 'store_customer_address_response.g.dart';

/// The address's details.
@JsonSerializable()
class StoreCustomerAddressResponse {
  const StoreCustomerAddressResponse({required this.address});

  factory StoreCustomerAddressResponse.fromJson(Map<String, Object?> json) =>
      _$StoreCustomerAddressResponseFromJson(json);

  final StoreCustomerAddress address;

  Map<String, Object?> toJson() => _$StoreCustomerAddressResponseToJson(this);
}
