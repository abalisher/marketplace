// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'update_address.g.dart';

/// The details to update in the address.
@JsonSerializable()
class UpdateAddress {
  const UpdateAddress({
    required this.id,
    this.customerId,
    this.company,
    this.firstName,
    this.lastName,
    this.address1,
    this.address2,
    this.city,
    this.countryCode,
    this.province,
    this.postalCode,
    this.phone,
    this.metadata,
  });

  factory UpdateAddress.fromJson(Map<String, Object?> json) =>
      _$UpdateAddressFromJson(json);

  /// The ID of an existing address to update.
  final String id;

  /// The ID of the customer that this address belongs to.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The address's company.
  final String? company;

  /// The address's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The address's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

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

  /// The address's phone.
  final String? phone;

  /// The address's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$UpdateAddressToJson(this);
}
