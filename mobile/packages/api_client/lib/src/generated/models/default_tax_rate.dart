// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'default_tax_rate.g.dart';

@JsonSerializable()
class DefaultTaxRate {
  const DefaultTaxRate({
    required this.code,
    required this.name,
    this.rate,
    this.isCombinable,
    this.metadata,
  });

  factory DefaultTaxRate.fromJson(Map<String, Object?> json) =>
      _$DefaultTaxRateFromJson(json);

  /// The rate to charge.
  final num? rate;

  /// The code the tax rate is identified by
  final String code;

  /// The default tax rate's name.
  final String name;

  /// Whether the tax rate should be combined with parent rates.
  @JsonKey(name: 'is_combinable')
  final bool? isCombinable;

  /// The default tax rate's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$DefaultTaxRateToJson(this);
}
