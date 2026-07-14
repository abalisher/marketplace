// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_shipping_option_type.g.dart';

/// The properties to update in the shipping option type.
@JsonSerializable()
class AdminUpdateShippingOptionType {
  const AdminUpdateShippingOptionType({
    this.code,
    this.description,
    this.label,
  });

  factory AdminUpdateShippingOptionType.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateShippingOptionTypeFromJson(json);

  /// The shipping option type's code.
  final String? code;

  /// The shipping option type's description.
  final String? description;

  /// The shipping option type's label.
  final String? label;

  Map<String, Object?> toJson() => _$AdminUpdateShippingOptionTypeToJson(this);
}
