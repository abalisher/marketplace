// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_shipping_option_type.g.dart';

/// The shipping option type's details.
@JsonSerializable()
class StoreShippingOptionType {
  const StoreShippingOptionType({
    required this.id,
    required this.label,
    required this.description,
    required this.code,
    required this.shippingOptionId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory StoreShippingOptionType.fromJson(Map<String, Object?> json) =>
      _$StoreShippingOptionTypeFromJson(json);

  /// The type's ID.
  final String id;

  /// The type's label.
  final String label;

  /// The type's description.
  final String description;

  /// The type's code.
  final String code;

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// The date the type was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the type was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the type was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$StoreShippingOptionTypeToJson(this);
}
