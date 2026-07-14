// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_product_type.g.dart';

/// The details of the product type to create.
@JsonSerializable()
class AdminCreateProductType {
  const AdminCreateProductType({
    required this.value,
    this.metadata,
    this.externalId,
  });

  factory AdminCreateProductType.fromJson(Map<String, Object?> json) =>
      _$AdminCreateProductTypeFromJson(json);

  /// The product's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The product type's value.
  final String value;

  /// The ID of the product type in an external or third-party system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminCreateProductTypeToJson(this);
}
