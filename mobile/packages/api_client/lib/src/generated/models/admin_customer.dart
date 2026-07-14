// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer_address.dart';
import 'admin_customer_group.dart';

part 'admin_customer.g.dart';

/// The customer's details.
@JsonSerializable()
class AdminCustomer {
  const AdminCustomer({
    required this.id,
    required this.hasAccount,
    required this.email,
    required this.defaultBillingAddressId,
    required this.defaultShippingAddressId,
    required this.companyName,
    required this.firstName,
    required this.lastName,
    required this.addresses,
    this.groups,
    this.phone,
    this.metadata,
    this.createdBy,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory AdminCustomer.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerFromJson(json);

  /// The customer's ID.
  final String id;

  /// Whether the customer is registered.
  @JsonKey(name: 'has_account')
  final bool hasAccount;

  /// The customer's groups.
  final List<AdminCustomerGroup>? groups;

  /// The customer's email.
  final String email;

  /// The ID of the address used as the default billing address.
  @JsonKey(name: 'default_billing_address_id')
  final String defaultBillingAddressId;

  /// The ID of the address used as the default shipping address.
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
  final List<AdminCustomerAddress> addresses;

  /// The customer's phone.
  final String? phone;

  /// The customer's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The ID of the user that created this customer, if available.
  @JsonKey(name: 'created_by')
  final String? createdBy;

  /// The customer's creation date.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The customer's update date.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The customer's deletion date.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminCustomerToJson(this);
}
