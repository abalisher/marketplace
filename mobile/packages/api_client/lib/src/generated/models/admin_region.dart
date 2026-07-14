// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_payment_provider.dart';
import 'admin_region_country.dart';

part 'admin_region.g.dart';

/// The region's details.
@JsonSerializable()
class AdminRegion {
  const AdminRegion({
    required this.id,
    required this.name,
    required this.currencyCode,
    this.automaticTaxes,
    this.countries,
    this.paymentProviders,
    this.metadata,
    this.createdAt,
    this.updatedAt,
  });

  factory AdminRegion.fromJson(Map<String, Object?> json) =>
      _$AdminRegionFromJson(json);

  /// The region's ID.
  final String id;

  /// The region's name.
  final String name;

  /// The region's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// Whether taxes are applied automatically during checkout.
  @JsonKey(name: 'automatic_taxes')
  final bool? automaticTaxes;

  /// The region's countries.
  final List<AdminRegionCountry>? countries;

  /// The region's payment providers.
  @JsonKey(name: 'payment_providers')
  final List<AdminPaymentProvider>? paymentProviders;

  /// The region's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the region was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the region was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$AdminRegionToJson(this);
}
