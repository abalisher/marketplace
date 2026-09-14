// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price_preference.g.dart';

/// The price preference's details.
@JsonSerializable()
class AdminPricePreference {
  const AdminPricePreference({
    required this.id,
    required this.attribute,
    required this.value,
    required this.isTaxInclusive,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminPricePreference.fromJson(Map<String, Object?> json) =>
      _$AdminPricePreferenceFromJson(json);

  /// The price preference's ID.
  final String id;

  /// The price preference's attribute.
  final String attribute;

  /// The price preference's value.
  final String value;

  /// Whether prices matching this preference include taxes.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The date the price preference was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the price preference was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the price preference was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminPricePreferenceToJson(this);
}
