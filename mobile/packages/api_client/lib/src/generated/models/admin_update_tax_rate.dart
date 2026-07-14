// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_tax_rate_rule.dart';

part 'admin_update_tax_rate.g.dart';

/// The properties to update in the tax rate.
@JsonSerializable()
class AdminUpdateTaxRate {
  const AdminUpdateTaxRate({
    this.rate,
    this.code,
    this.rules,
    this.name,
    this.isDefault,
    this.isCombinable,
    this.metadata,
  });

  factory AdminUpdateTaxRate.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateTaxRateFromJson(json);

  /// The rate to charge.
  final num? rate;

  /// The code that the tax rate is identified by.
  final String? code;

  /// The tax rate's rules.
  final List<AdminCreateTaxRateRule>? rules;

  /// The tax rate's name.
  final String? name;

  /// Whether the tax rate is the default in the store.
  @JsonKey(name: 'is_default')
  final bool? isDefault;

  /// Whether the tax rate should be combined with parent rates.
  @JsonKey(name: 'is_combinable')
  final bool? isCombinable;

  /// The tax rate's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateTaxRateToJson(this);
}
