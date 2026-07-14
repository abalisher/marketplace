// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_upsert_stock_location_address.g.dart';

/// The details of the stock location address to create.
@JsonSerializable()
class AdminUpsertStockLocationAddress {
  const AdminUpsertStockLocationAddress({
    required this.address1,
    required this.countryCode,
    this.address2,
    this.company,
    this.city,
    this.phone,
    this.postalCode,
    this.province,
    this.metadata,
  });

  factory AdminUpsertStockLocationAddress.fromJson(Map<String, Object?> json) =>
      _$AdminUpsertStockLocationAddressFromJson(json);

  /// The address's first line.
  @JsonKey(name: 'address_1')
  final String address1;

  /// The address's second line.
  @JsonKey(name: 'address_2')
  final String? address2;

  /// The address's company.
  final String? company;

  /// The address's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The address's city.
  final String? city;

  /// The address's phone.
  final String? phone;

  /// The address's postal code.
  @JsonKey(name: 'postal_code')
  final String? postalCode;

  /// The address's ISO 3166-2 province code. Must be lower-case.
  final String? province;

  /// The address's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminUpsertStockLocationAddressToJson(this);
}
