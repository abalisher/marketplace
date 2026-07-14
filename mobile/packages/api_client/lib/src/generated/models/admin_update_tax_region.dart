// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_tax_region.g.dart';

/// The details to update in a tax region.
@JsonSerializable()
class AdminUpdateTaxRegion {
  const AdminUpdateTaxRegion({
    this.provinceCode,
    this.metadata,
    this.providerId,
  });

  factory AdminUpdateTaxRegion.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateTaxRegionFromJson(json);

  /// The tax region's ISO 3166-2 province code. Must be lower-case.
  @JsonKey(name: 'province_code')
  final String? provinceCode;

  /// The tax region's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the tax provider to use when calculating taxes for this tax region.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  Map<String, Object?> toJson() => _$AdminUpdateTaxRegionToJson(this);
}
