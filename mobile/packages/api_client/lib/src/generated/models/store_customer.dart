// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer_address.dart';

part 'store_customer.g.dart';

/// The customer's details.
@JsonSerializable()
class StoreCustomer {
  const StoreCustomer({
    required this.id,
    required this.email,
    required this.defaultBillingAddressId,
    required this.defaultShippingAddressId,
    required this.companyName,
    required this.firstName,
    required this.lastName,
    required this.addresses,
    this.phone,
    this.metadata,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory StoreCustomer.fromJson(Map<String, Object?> json) =>
      _$StoreCustomerFromJson(json);

  /// The customer's ID.
  final String id;

  /// The customer's email.
  final String email;

  /// The ID of the address used for billing by default.
  @JsonKey(name: 'default_billing_address_id')
  final String defaultBillingAddressId;

  /// The ID of the address used for shipping by default.
  @JsonKey(name: 'default_shipping_address_id')
  final String defaultShippingAddressId;

  /// The customer's company name.
  @JsonKey(name: 'company_name')
  final String companyName;

  /// The customer's first name.
  @JsonKey(name: 'first_name')
  final String firstName;

  /// The customer's last name.
  @JsonKey(name: 'last_name')
  final String lastName;

  /// The customer's addresses.
  final List<StoreCustomerAddress> addresses;

  /// The customer's phone.
  final String? phone;

  /// The customer's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the customer was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the customer was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the customer was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$StoreCustomerToJson(this);
}
