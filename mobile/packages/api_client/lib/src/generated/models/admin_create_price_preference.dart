// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_price_preference.g.dart';

/// The price preference's details.
@JsonSerializable()
class AdminCreatePricePreference {
  const AdminCreatePricePreference({
    required this.attribute,
    required this.value,
    this.isTaxInclusive,
  });

  factory AdminCreatePricePreference.fromJson(Map<String, Object?> json) =>
      _$AdminCreatePricePreferenceFromJson(json);

  /// The name of the attribute the price preference applies on.
  final String attribute;

  /// The attribute's value.
  final String value;

  /// Whether the price is tax inclusive if the value of the specified attribute matches the specified value.
  @JsonKey(name: 'is_tax_inclusive')
  final bool? isTaxInclusive;

  Map<String, Object?> toJson() => _$AdminCreatePricePreferenceToJson(this);
}
