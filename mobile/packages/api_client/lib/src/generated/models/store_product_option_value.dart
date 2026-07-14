// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_product_option_value.g.dart';

/// The product option value's details.
@JsonSerializable()
class StoreProductOptionValue {
  const StoreProductOptionValue({
    required this.id,
    required this.value,
    this.option,
    this.optionId,
    this.metadata,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.rank,
  });

  factory StoreProductOptionValue.fromJson(Map<String, Object?> json) =>
      _$StoreProductOptionValueFromJson(json);

  /// The value's ID.
  final String id;

  /// The value.
  final String value;
  final dynamic option;

  /// The ID of the option this value belongs to.
  @JsonKey(name: 'option_id')
  final String? optionId;

  /// The value's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the value was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the value was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the value was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The rank of the value among other option values.
  final num? rank;

  Map<String, Object?> toJson() => _$StoreProductOptionValueToJson(this);
}
