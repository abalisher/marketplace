// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_product_tag.g.dart';

/// The product tag's details.
@JsonSerializable()
class AdminCreateProductTag {
  const AdminCreateProductTag({
    required this.value,
    this.metadata,
    this.externalId,
  });

  factory AdminCreateProductTag.fromJson(Map<String, Object?> json) =>
      _$AdminCreateProductTagFromJson(json);

  /// The product tag's value.
  final String value;

  /// The product tag's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The ID of the product tag in an external or third-party system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminCreateProductTagToJson(this);
}
