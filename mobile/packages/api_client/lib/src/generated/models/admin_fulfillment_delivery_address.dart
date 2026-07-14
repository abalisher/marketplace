// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_delivery_address.g.dart';

/// The address to deliver the items to.
@JsonSerializable()
class AdminFulfillmentDeliveryAddress {
  const AdminFulfillmentDeliveryAddress({
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
    this.metadata,
  });

  factory AdminFulfillmentDeliveryAddress.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentDeliveryAddressFromJson(json);

  /// The customer's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The customer's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

  /// The customer's phone.
  final String? phone;

  /// The delivery address's company.
  final String? company;

  /// The delivery address's first line.
  @JsonKey(name: 'address_1')
  final String? address1;

  /// The delivery address's second line.
  @JsonKey(name: 'address_2')
  final String? address2;

  /// The delivery address's city.
  final String? city;

  /// The delivery address's country code.
  @JsonKey(name: 'country_code')
  final String? countryCode;

  /// The delivery address's ISO 3166-2 province code. Must be lower-case.
  final String? province;

  /// The delivery address's postal code.
  @JsonKey(name: 'postal_code')
  final String? postalCode;

  /// The delivery address's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminFulfillmentDeliveryAddressToJson(this);
}
