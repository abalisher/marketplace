// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_update_customer_address.g.dart';

/// The properties to update in the address.
@JsonSerializable()
class StoreUpdateCustomerAddress {
  const StoreUpdateCustomerAddress({
    this.firstName,
    this.lastName,
    this.phone,
    this.company,
    this.address1,
    this.address2,
    this.city,
    this.countryCode,
    this.province,
    this.postalCode,
    this.addressName,
    this.isDefaultShipping,
    this.isDefaultBilling,
    this.metadata,
  });

  factory StoreUpdateCustomerAddress.fromJson(Map<String, Object?> json) =>
      _$StoreUpdateCustomerAddressFromJson(json);

  /// The customer's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The customer's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

  /// The customer's phone.
  final String? phone;

  /// The address's company.
  final String? company;

  /// The address's first line.
  @JsonKey(name: 'address_1')
  final String? address1;

  /// The address's second line.
  @JsonKey(name: 'address_2')
  final String? address2;

  /// The address's city.
  final String? city;

  /// The address's country code.
  @JsonKey(name: 'country_code')
  final String? countryCode;

  /// The address's ISO 3166-2 province code. Must be lower-case.
  final String? province;

  /// The address's postal code.
  @JsonKey(name: 'postal_code')
  final String? postalCode;

  /// The address's name.
  @JsonKey(name: 'address_name')
  final String? addressName;

  /// Whether the address is used by default for shipping during checkout.
  @JsonKey(name: 'is_default_shipping')
  final bool? isDefaultShipping;

  /// Whether the address is used by default for billing during checkout.
  @JsonKey(name: 'is_default_billing')
  final bool? isDefaultBilling;

  /// Holds custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$StoreUpdateCustomerAddressToJson(this);
}
