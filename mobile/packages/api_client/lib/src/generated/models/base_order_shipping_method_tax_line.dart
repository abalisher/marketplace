// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_order_shipping_method_tax_line.g.dart';

/// The tax line's details.
@JsonSerializable()
class BaseOrderShippingMethodTaxLine {
  const BaseOrderShippingMethodTaxLine({
    required this.shippingMethod,
    required this.shippingMethodId,
    required this.total,
    required this.subtotal,
    required this.id,
    required this.code,
    required this.rate,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.taxRateId,
    this.providerId,
  });

  factory BaseOrderShippingMethodTaxLine.fromJson(Map<String, Object?> json) =>
      _$BaseOrderShippingMethodTaxLineFromJson(json);

  @JsonKey(name: 'shipping_method')
  final dynamic shippingMethod;

  /// The ID of the shipping method this tax line belongs to.
  @JsonKey(name: 'shipping_method_id')
  final String shippingMethodId;

  /// The shipping method's total including taxes and promotions.
  final num total;

  /// The shipping method's total excluding taxes, including promotions.
  final num subtotal;

  /// The tax line's ID.
  final String id;

  /// The tax line's description.
  final String? description;

  /// The ID of the applied tax rate.
  @JsonKey(name: 'tax_rate_id')
  final String? taxRateId;

  /// The code that the tax rate is identified by.
  final String code;

  /// The rate to charge.
  final num rate;

  /// The ID of the tax provider handling the tax calculation.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  /// The date the tax line was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the tax line was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$BaseOrderShippingMethodTaxLineToJson(this);
}
