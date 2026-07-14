// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'default_tax_rate.dart';

part 'admin_create_tax_region.g.dart';

/// The tax region's details.
@JsonSerializable()
class AdminCreateTaxRegion {
  const AdminCreateTaxRegion({
    required this.countryCode,
    this.provinceCode,
    this.parentId,
    this.defaultTaxRate,
    this.metadata,
    this.providerId,
  });

  factory AdminCreateTaxRegion.fromJson(Map<String, Object?> json) =>
      _$AdminCreateTaxRegionFromJson(json);

  /// The tax region's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The tax region's ISO 3166-2 province code. Must be lower-case.
  @JsonKey(name: 'province_code')
  final String? provinceCode;

  /// The ID of the parent tax region.
  @JsonKey(name: 'parent_id')
  final String? parentId;

  /// The tax region's default tax rate.
  @JsonKey(name: 'default_tax_rate')
  final DefaultTaxRate? defaultTaxRate;

  /// The tax region's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The ID of the tax provider used to calculate the tax rate in this tax region.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  Map<String, Object?> toJson() => _$AdminCreateTaxRegionToJson(this);
}
