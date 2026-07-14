// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_stock_location_address.g.dart';

/// The details of the stock location address.
@JsonSerializable()
class AdminStockLocationAddress {
  const AdminStockLocationAddress({
    required this.id,
    required this.address1,
    required this.address2,
    required this.company,
    required this.countryCode,
    required this.city,
    required this.phone,
    required this.postalCode,
    required this.province,
    required this.metadata,
  });

  factory AdminStockLocationAddress.fromJson(Map<String, Object?> json) =>
      _$AdminStockLocationAddressFromJson(json);

  /// The address's ID.
  final String id;

  /// The address's first line.
  @JsonKey(name: 'address_1')
  final String address1;

  /// The address's second line.
  @JsonKey(name: 'address_2')
  final String address2;

  /// The address's company.
  final String company;

  /// The address's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The address's city.
  final String city;

  /// The address's phone.
  final String phone;

  /// The address's postal code.
  @JsonKey(name: 'postal_code')
  final String postalCode;

  /// The address's lower-case ISO 3166-2 province code.
  final String province;

  /// The address's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminStockLocationAddressToJson(this);
}
