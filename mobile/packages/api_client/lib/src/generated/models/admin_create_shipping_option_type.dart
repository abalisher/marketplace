// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_shipping_option_type.g.dart';

/// The shipping option type's details.
@JsonSerializable()
class AdminCreateShippingOptionType {
  const AdminCreateShippingOptionType({
    required this.label,
    required this.code,
    this.description,
  });

  factory AdminCreateShippingOptionType.fromJson(Map<String, Object?> json) =>
      _$AdminCreateShippingOptionTypeFromJson(json);

  /// The type's label.
  final String label;

  /// The type's description.
  final String? description;

  /// The type's code.
  final String code;

  Map<String, Object?> toJson() => _$AdminCreateShippingOptionTypeToJson(this);
}
