// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_customer_address.g.dart';

/// The customer's address.
@JsonSerializable()
class AdminCustomerAddress {
  const AdminCustomerAddress({
    required this.id,
    required this.addressName,
    required this.isDefaultShipping,
    required this.isDefaultBilling,
    required this.customerId,
    required this.company,
    required this.firstName,
    required this.lastName,
    required this.address1,
    required this.address2,
    required this.city,
    required this.countryCode,
    required this.province,
    required this.postalCode,
    required this.phone,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AdminCustomerAddress.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerAddressFromJson(json);

  /// The address's ID.
  final String id;

  /// The address's name.
  @JsonKey(name: 'address_name')
  final String addressName;

  /// Whether the address is the default shipping address.
  @JsonKey(name: 'is_default_shipping')
  final bool isDefaultShipping;

  /// Whether the address is the default billing address.
  @JsonKey(name: 'is_default_billing')
  final bool isDefaultBilling;

  /// The ID of the customer that this address belongs to.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The customer's company.
  final String company;

  /// The customer's first name.
  @JsonKey(name: 'first_name')
  final String firstName;

  /// The customer's last name.
  @JsonKey(name: 'last_name')
  final String lastName;

  /// The address's first line.
  @JsonKey(name: 'address_1')
  final String address1;

  /// The address's second line.
  @JsonKey(name: 'address_2')
  final String address2;

  /// The address's city.
  final String city;

  /// The address's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The address's lower-case ISO 3166-2 province code.
  final String province;

  /// The address's postal code.
  @JsonKey(name: 'postal_code')
  final String postalCode;

  /// The address's phone.
  final String phone;

  /// The address's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The address's creation date.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The address's update date.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminCustomerAddressToJson(this);
}
