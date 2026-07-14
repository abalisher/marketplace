// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_region_country.g.dart';

/// The country's details.
@JsonSerializable()
class AdminRegionCountry {
  const AdminRegionCountry({
    required this.id,
    this.iso2,
    this.iso3,
    this.numCode,
    this.name,
    this.displayName,
  });

  factory AdminRegionCountry.fromJson(Map<String, Object?> json) =>
      _$AdminRegionCountryFromJson(json);

  /// The country's ID.
  final String id;

  /// The country's iso 2.
  @JsonKey(name: 'iso_2')
  final String? iso2;

  /// The country's iso 3.
  @JsonKey(name: 'iso_3')
  final String? iso3;

  /// The country's num code.
  @JsonKey(name: 'num_code')
  final String? numCode;

  /// The country's name.
  final String? name;

  /// The country's display name.
  @JsonKey(name: 'display_name')
  final String? displayName;

  Map<String, Object?> toJson() => _$AdminRegionCountryToJson(this);
}
