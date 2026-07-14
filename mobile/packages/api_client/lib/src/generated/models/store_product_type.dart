// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_product_type.g.dart';

/// The product type's details.
@JsonSerializable()
class StoreProductType {
  const StoreProductType({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.value,
    this.metadata,
    this.deletedAt,
    this.externalId,
  });

  factory StoreProductType.fromJson(Map<String, Object?> json) =>
      _$StoreProductTypeFromJson(json);

  /// The product type's ID.
  final String id;

  /// The product type's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the product type was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the product type was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the product type was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The type's value.
  final String value;

  /// The type's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$StoreProductTypeToJson(this);
}
