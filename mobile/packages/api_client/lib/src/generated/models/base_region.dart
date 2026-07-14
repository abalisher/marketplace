// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_payment_provider.dart';
import 'base_region_country.dart';

part 'base_region.g.dart';

/// The region's details.
@JsonSerializable()
class BaseRegion {
  const BaseRegion({
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

  factory BaseRegion.fromJson(Map<String, Object?> json) =>
      _$BaseRegionFromJson(json);

  /// The region's ID.
  final String id;

  /// The region's name.
  final String name;

  /// The region's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The region's automatic taxes.
  @JsonKey(name: 'automatic_taxes')
  final bool? automaticTaxes;

  /// The region's countries.
  final List<BaseRegionCountry>? countries;

  /// The region's payment providers.
  @JsonKey(name: 'payment_providers')
  final List<AdminPaymentProvider>? paymentProviders;

  /// The region's metadata.
  final dynamic metadata;

  /// The region's created at.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The region's updated at.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$BaseRegionToJson(this);
}
