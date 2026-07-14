// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_price_preference.g.dart';

/// The details to update in the price preference.
@JsonSerializable()
class AdminUpdatePricePreference {
  const AdminUpdatePricePreference({
    this.attribute,
    this.value,
    this.isTaxInclusive,
  });

  factory AdminUpdatePricePreference.fromJson(Map<String, Object?> json) =>
      _$AdminUpdatePricePreferenceFromJson(json);

  /// The price preference's attribute.
  final String? attribute;

  /// The price preference's value.
  final String? value;

  /// Whether prices are tax inclusive for this price preference.
  @JsonKey(name: 'is_tax_inclusive')
  final bool? isTaxInclusive;

  Map<String, Object?> toJson() => _$AdminUpdatePricePreferenceToJson(this);
}
