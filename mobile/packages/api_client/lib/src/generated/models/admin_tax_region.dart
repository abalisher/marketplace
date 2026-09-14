// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_tax_region.g.dart';

/// The tax region's details.
@JsonSerializable()
class AdminTaxRegion {
  const AdminTaxRegion({
    required this.id,
    required this.countryCode,
    required this.provinceCode,
    required this.metadata,
    required this.parentId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.createdBy,
    required this.taxRates,
    required this.parent,
    required this.children,
  });

  factory AdminTaxRegion.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRegionFromJson(json);

  /// The tax region's ID.
  final String id;

  /// The tax region's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The tax region's lower-case ISO 3166-2 province code.
  @JsonKey(name: 'province_code')
  final String provinceCode;

  /// The tax region's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the parent tax region.
  @JsonKey(name: 'parent_id')
  final String parentId;

  /// The date the tax region was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the tax region was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the tax region was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The ID of the user that created the tax region.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The tax region's rates.
  @JsonKey(name: 'tax_rates')
  final List<dynamic> taxRates;
  final dynamic parent;

  /// The tax region's children.
  final List<dynamic> children;

  Map<String, Object?> toJson() => _$AdminTaxRegionToJson(this);
}
