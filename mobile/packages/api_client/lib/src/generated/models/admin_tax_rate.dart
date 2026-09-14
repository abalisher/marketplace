// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_tax_rate_rule.dart';
import 'admin_tax_region.dart';

part 'admin_tax_rate.g.dart';

/// The tax rate's details.
@JsonSerializable()
class AdminTaxRate {
  const AdminTaxRate({
    required this.id,
    required this.rate,
    required this.code,
    required this.name,
    required this.metadata,
    required this.taxRegionId,
    required this.isCombinable,
    required this.isDefault,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.createdBy,
    required this.taxRegion,
    required this.rules,
  });

  factory AdminTaxRate.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRateFromJson(json);

  /// The tax rate's ID.
  final String id;

  /// The rate to charge.
  final num rate;

  /// The code the tax rate is identified by.
  final String code;

  /// The tax rate's name.
  final String name;

  /// The tax rate's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the tax region this rate belongs to.
  @JsonKey(name: 'tax_region_id')
  final String taxRegionId;

  /// Whether the tax rate should be combined with parent rates.
  @JsonKey(name: 'is_combinable')
  final bool isCombinable;

  /// Whether this tax rate is the default in the tax region.
  @JsonKey(name: 'is_default')
  final bool isDefault;

  /// The date the tax rate was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the tax rate was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the tax rate was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The ID of the user that created the tax rate.
  @JsonKey(name: 'created_by')
  final String createdBy;
  @JsonKey(name: 'tax_region')
  final AdminTaxRegion taxRegion;

  /// The tax rate's rules.
  final List<AdminTaxRateRule> rules;

  Map<String, Object?> toJson() => _$AdminTaxRateToJson(this);
}
