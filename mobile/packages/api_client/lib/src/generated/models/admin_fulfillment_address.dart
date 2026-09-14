// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_address.g.dart';

/// An address's details.
@JsonSerializable()
class AdminFulfillmentAddress {
  const AdminFulfillmentAddress({
    required this.id,
    required this.fulfillmentId,
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
    required this.deletedAt,
  });

  factory AdminFulfillmentAddress.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentAddressFromJson(json);

  /// The address's ID.
  final String id;

  /// The ID of the fulfillment that the address belongs to.
  @JsonKey(name: 'fulfillment_id')
  final String fulfillmentId;

  /// The address's company.
  final String company;

  /// The address's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The address's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

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

  /// The date the address was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminFulfillmentAddressToJson(this);
}
