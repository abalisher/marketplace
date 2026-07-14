// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_product_type.g.dart';

/// The product type's details.
@JsonSerializable()
class BaseProductType {
  const BaseProductType({
    required this.id,
    required this.value,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.metadata,
    this.externalId,
  });

  factory BaseProductType.fromJson(Map<String, Object?> json) =>
      _$BaseProductTypeFromJson(json);

  /// The type's ID.
  final String id;

  /// The type's value.
  final String value;

  /// The date the type was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the type was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the type was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The type's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The type's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$BaseProductTypeToJson(this);
}
