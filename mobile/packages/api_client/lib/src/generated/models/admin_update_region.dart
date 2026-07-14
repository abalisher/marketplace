// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_region.g.dart';

/// The propeties to update in the region.
@JsonSerializable()
class AdminUpdateRegion {
  const AdminUpdateRegion({
    this.name,
    this.currencyCode,
    this.countries,
    this.automaticTaxes,
    this.paymentProviders,
    this.metadata,
    this.isTaxInclusive,
  });

  factory AdminUpdateRegion.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateRegionFromJson(json);

  /// The region's name.
  final String? name;

  /// The region's currency code.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The region's countries.
  final List<String>? countries;

  /// Whether taxes are calculated automatically for carts in the region.
  @JsonKey(name: 'automatic_taxes')
  final bool? automaticTaxes;

  /// The payment providers enabled in the region.
  @JsonKey(name: 'payment_providers')
  final List<String>? paymentProviders;

  /// The region's metadata. Can hold custom key-value pairs.
  final dynamic metadata;

  /// Whether the prices in the region are tax inclusive.
  @JsonKey(name: 'is_tax_inclusive')
  final bool? isTaxInclusive;

  Map<String, Object?> toJson() => _$AdminUpdateRegionToJson(this);
}
