// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_region.g.dart';

/// The region's details.
@JsonSerializable()
class AdminCreateRegion {
  const AdminCreateRegion({
    required this.name,
    required this.currencyCode,
    this.countries,
    this.automaticTaxes,
    this.isTaxInclusive,
    this.paymentProviders,
    this.metadata,
  });

  factory AdminCreateRegion.fromJson(Map<String, Object?> json) =>
      _$AdminCreateRegionFromJson(json);

  /// The region's name.
  final String name;

  /// The region's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The region's countries.
  final List<String>? countries;

  /// Whether taxes are calculated automatically during checkout in this region.
  @JsonKey(name: 'automatic_taxes')
  final bool? automaticTaxes;

  /// Whether prices in this region are tax inclusive.
  @JsonKey(name: 'is_tax_inclusive')
  final bool? isTaxInclusive;

  /// The payment providers enabled in this region.
  @JsonKey(name: 'payment_providers')
  final List<String>? paymentProviders;

  /// The region's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateRegionToJson(this);
}
