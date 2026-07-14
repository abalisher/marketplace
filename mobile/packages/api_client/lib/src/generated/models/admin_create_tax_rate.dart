// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_tax_rate_rule.dart';

part 'admin_create_tax_rate.g.dart';

/// The tax rate's details.
@JsonSerializable()
class AdminCreateTaxRate {
  const AdminCreateTaxRate({
    required this.name,
    required this.taxRegionId,
    required this.code,
    this.rate,
    this.rules,
    this.isDefault,
    this.isCombinable,
    this.metadata,
  });

  factory AdminCreateTaxRate.fromJson(Map<String, Object?> json) =>
      _$AdminCreateTaxRateFromJson(json);

  /// The tax rate's name.
  final String name;

  /// The ID of the tax region this rate belongs to.
  @JsonKey(name: 'tax_region_id')
  final String taxRegionId;

  /// The rate to charge.
  final num? rate;

  /// The code the tax rate is identified by.
  final String code;

  /// The tax rate's rules.
  final List<AdminCreateTaxRateRule>? rules;

  /// Whether the tax rate is the default in its tax region.
  @JsonKey(name: 'is_default')
  final bool? isDefault;

  /// Whether the tax rate should be combined with parent rates.
  @JsonKey(name: 'is_combinable')
  final bool? isCombinable;

  /// The tax rate's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateTaxRateToJson(this);
}
