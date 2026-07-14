// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_shipping_option_type.g.dart';

/// The shipping option's details.
@JsonSerializable()
class AdminShippingOptionType {
  const AdminShippingOptionType({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.label,
    required this.description,
    required this.code,
    required this.shippingOptionId,
  });

  factory AdminShippingOptionType.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionTypeFromJson(json);

  /// The shipping option's ID.
  final String id;

  /// The date the shipping option was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping option was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the shipping option was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  /// The type's label.
  final String label;

  /// The type's description.
  final String description;

  /// The type's code.
  final String code;

  /// The type's shipping option id.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  Map<String, Object?> toJson() => _$AdminShippingOptionTypeToJson(this);
}
