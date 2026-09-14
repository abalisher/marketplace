// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_region_country.g.dart';

/// The country's details.
@JsonSerializable()
class BaseRegionCountry {
  const BaseRegionCountry({
    required this.id,
    this.iso2,
    this.iso3,
    this.numCode,
    this.name,
    this.displayName,
  });

  factory BaseRegionCountry.fromJson(Map<String, Object?> json) =>
      _$BaseRegionCountryFromJson(json);

  /// The country's ID.
  final String? id;

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

  Map<String, Object?> toJson() => _$BaseRegionCountryToJson(this);
}
