// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_fulfillment_address.g.dart';

/// The location's address details.
@JsonSerializable()
class StoreFulfillmentAddress {
  const StoreFulfillmentAddress({
    required this.id,
    required this.company,
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

  factory StoreFulfillmentAddress.fromJson(Map<String, Object?> json) =>
      _$StoreFulfillmentAddressFromJson(json);

  /// The address's ID.
  final String id;

  /// The address's company.
  final String company;

  /// The first line of the address.
  @JsonKey(name: 'address_1')
  final String address1;

  /// The second line of the address.
  @JsonKey(name: 'address_2')
  final String address2;

  /// The address's city.
  final String city;

  /// The address's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The address's province.
  final String province;

  /// The address's postal code.
  @JsonKey(name: 'postal_code')
  final String postalCode;

  /// The address's phone.
  final String phone;

  /// The address's metadata. Can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the address was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the address was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the address was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$StoreFulfillmentAddressToJson(this);
}
