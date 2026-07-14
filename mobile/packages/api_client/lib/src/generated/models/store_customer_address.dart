// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_customer_address.g.dart';

/// The customer address's details
@JsonSerializable()
class StoreCustomerAddress {
  const StoreCustomerAddress({
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

  factory StoreCustomerAddress.fromJson(Map<String, Object?> json) =>
      _$StoreCustomerAddressFromJson(json);

  /// The address's ID.
  final String id;

  /// The address's name.
  @JsonKey(name: 'address_name')
  final String addressName;

  /// Whether the address is used for shipping by default.
  @JsonKey(name: 'is_default_shipping')
  final bool isDefaultShipping;

  /// Whether the address is used for billing by default.
  @JsonKey(name: 'is_default_billing')
  final bool isDefaultBilling;

  /// The ID of the customer the address belongs to.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The address's company.
  final String company;

  /// The address's first name.
  @JsonKey(name: 'first_name')
  final String firstName;

  /// The address's last name.
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

  /// The address's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the address was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the address was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$StoreCustomerAddressToJson(this);
}
